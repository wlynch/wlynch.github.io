---
title: "Tekton and GKE Workload Identity"
date: 2021-03-04
---

# What is Workload Identity?

When running a workload on Kubernetes, each Pod has an underlying [service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) identity that is used for interacting with the Kubernetes API and resources.

GCP has a similar concept of [service accounts](https://cloud.google.com/iam/docs/service-accounts) as a means for programs to authenticate to Google APIs. To make management of these secrets easier, GCP compute environments provide a mechanism called [Application Default Credentials](https://cloud.google.com/docs/authentication/production#automatically) that allows users to map a VM to a particular service account. When this is done, GCP libraries running on that VM can fetch credentials for the configured service account automatically by using the VM's baked in [Metadata Service](https://cloud.google.com/compute/docs/storing-retrieving-metadata).

Although they share the same name, Kubernetes Service Accounts (KSA) are separate from Google Service Accounts (GSA). By default when you run a workload on Kubernetes, Application Default Credentials will use the service account associated to the Node (i.e. VM) regardless of the Pod's KSA.
If you wanted to ensure that different Pods used different GSA identities, you would either need to pass in service account credentials manually or separate workloads onto different Nodes (which means you need to peel back Kubernetes abstractions to be aware of the underlying node pools you are running on).

Both of these options aren't great - ideally we would be able to use KSAs just like GSAs to scope GCP permissions for each running Pod. This is where [GKE Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) comes in! Workload Identity allows you to map KSAs to corresponding GSAs so that Application Default Credentials in Pods can fetch GSA credentials based on the Pod's KSA identity.

This is a great feature that allows you to authenticate to external GCP services, without needing to worry about managing credentials. With Tekton this is particularly useful since we often need to interact with GCP resources as part of CI/CD:

  - Push/Pull from Artifact Registry
  - Read/Write from GCS
  - Git clone from Cloud Source Repositories
  - Deploy to Cloud Run / App Engine / GCE / GKE / etc.

# Configuring Tekton

Since Tekton runs on Kubernetes, we can use Workload Identity to simplify credential management when running on GKE.

If you don't have Workload Identity enabled on your cluster yet, check out [this guide](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity#enable_on_cluster) to get set up.
The following examples assume that the Workload Identity feature is already enabled on your cluster.

## Authentication in a Task

For this example, we will set up a simple Tekton build, using Workload Identity to handle pushing the artifact.

We will create a KSA named `build-robot` with a GSA with the same name e.g. `build-robot@${PROJECT_ID}.iam.gserviceaccount.com`. 

For this example I am using `wlynch-test` as my GCP project - replace this with your own!

1. Create the KSA

  ```sh
  $ kubectl create serviceaccount build-robot
  ```

2. Create the GSA

  ```sh
  gcloud iam service-accounts create build-robot
  ```

3. Grant the GSA permissions to push to the image repository

    For our example, we will use `us-docker.pkg.dev/wlynch-test/test`.

    If you're unfamiliar with the `pkg.dev` URL - this is an [Artifact Registry](https://cloud.google.com/artifact-registry) URL, the successor to GCR. Highly recommend trying it out if you haven't yet!

    ```sh
    $ gcloud artifacts repositories add-iam-policy-binding test \
    --location us \
    --member=serviceAccount:build-robot@wlynch-test.iam.gserviceaccount.com \
    --role=roles/artifactregistry.writer
    ```

4. Setup Workload Identity Mappings

    - KSA -> GSA
    
    ```sh
    $ kubectl annotate serviceaccount \
    build-robot \
    iam.gke.io/gcp-service-account=build-robot@wlynch-test.iam.gserviceaccount.com
    ```

    - GSA -> KSA
    
    ```sh
    gcloud iam service-accounts add-iam-policy-binding \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:wlynch-test.svc.id.goog[default/build-robot]" \
    build-robot@wlynch-test.iam.gserviceaccount.com
    ```

5. Build and Push

    Given the following `taskrun.yaml`:

    ```yaml
    apiVersion: tekton.dev/v1beta1
    kind: TaskRun
    metadata:
      name: workload-identity
    spec:
      serviceAccountName: build-robot
      taskSpec:
        steps:
          - name: checkout
            image: docker.io/alpine/git
            args: ["clone", "https://github.com/googlecloudplatform/cloud-run-hello", "."]
          # This step isn't necessary - it just prints out the
          # current authenticated user.
          - name: check-auth
            image: gcr.io/google.com/cloudsdktool/cloud-sdk
            args: ["gcloud", "auth", "list"]
          - name: build
            image: "gcr.io/kaniko-project/executor:v1.5.1"
            args: [
              "--dockerfile=Dockerfile",
              "--context=dir://.",
              "--destination=us-docker.pkg.dev/wlynch-test/test/cloud-run-hello:latest",
            ]
    ```

    We can execute this by running:

    ```sh
    $ kubectl apply -f taskrun.yaml
    ```

    The `kaniko` step will automatically use Application Default Credentials + Workload Identity to get a credential for the configured GSA and push the image to the repository!

## Using Private Images

In the example above, we used publicly available builder images to push a private image. But what if we want to use a private image in a build step?

This is a bit more complicated, since there's actually multiple identities that need to read the image when Tasks are scheduled-

1. The underlying TaskRun Pod needs to fetch the image to run it.
2. The Tekton Pipeline controller needs to read the image metadata to properly [set up the Tekton runtime environment](https://github.com/tektoncd/pipeline/blob/master/docs/container-contract.md).

Both KSAs need to be configured with Workload Identity in order for Tekton to handle private images.

### Grant the TaskRun Pod Access

We already have Workload Identity set up from the last section, so we can reuse this and simply grant the GSA any additional read permissions it needs. For example, to grant read-only permissions to all Artifact Registry Docker repositories in the project:

```sh
$ gcloud projects add-iam-policy-binding wlynch-test \
--member=serviceAccount:build-robot@wlynch-test.iam.gserviceaccount.com \
--role=roles/artifactregistry.reader
```

### Grant the Tekton Controller Access

To grant the Tekton controller access, we largely follow the same process as before, but use the controller's namespace ([`tekton-pipelines`](https://github.com/tektoncd/pipeline/blob/3ea59814fefa0650dede90a09e9a43af214480d6/config/controller.yaml#L19)) and service account ([`tekton-pipelines-controller`](https://github.com/tektoncd/pipeline/blob/3ea59814fefa0650dede90a09e9a43af214480d6/config/controller.yaml#L54)).

1. Create the GSA
```sh
gcloud iam service-accounts create tekton-pipelines-controller
```

2. Grant the GSA read permissions.

```sh
$ gcloud projects add-iam-policy-binding wlynch-test \
--member=serviceAccount:tekton-pipelines-controller@wlynch-test.iam.gserviceaccount.com \
--role=roles/artifactregistry.reader
```

3. Setup Workload Identity Mappings

    1. KSA -> GSA
    ```sh
    $ kubectl annotate serviceaccount \
    -n tekton-pipelines \
    tekton-pipelines-controller \
    iam.gke.io/gcp-service-account=tekton-pipelines-controller@wlynch-test.iam.gserviceaccount.com
    ```

    2. GSA -> KSA
    ```sh
    gcloud iam service-accounts add-iam-policy-binding \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:wlynch-test.svc.id.goog[tekton-pipelines/tekton-pipelines-controller]" \
    tekton-pipelines-controller@wlynch-test.iam.gserviceaccount.com
    ```

4. Build with a private image

    To test this, we'll use a slightly modified taskrun.yaml, replacing the kaniko builder image with a copy hosted in our own repository.

    ```yaml
    apiVersion: tekton.dev/v1beta1
    kind: TaskRun
    metadata:
      name: workload-identity
    spec:
      serviceAccountName: build-robot
      taskSpec:
        steps:
          - name: checkout
            image: docker.io/alpine/git
            args: ["clone", "https://github.com/googlecloudplatform/cloud-run-hello", "."]
          - name: build
            # This is the same image as before but in a private repo.
            image: "us-docker.pkg.dev/wlynch-test/test/kaniko:v1.5.1"
            args: [
              "--dockerfile=Dockerfile",
              "--context=dir://.",
              "--destination=us-docker.pkg.dev/wlynch-test/test/cloud-run-hello:latest",
            ]
    ```

# Related Docs

Here are some links I found helpful to understand how Workload Identity works:

- [Keyless Entry: Securely Access GCP Services From Kubernetes (Cloud Next '19)](https://www.youtube.com/watch?v=s4NYEJDFc0M) - Technical overview on how Workload Identity works
- https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity - Step by step guide for setting up and configuring Workload Identity on your cluster.
- https://cloud.google.com/blog/products/containers-kubernetes/introducing-gke-autopilot - Managed GKE clusters with Workload Identity enabled by default. 😎