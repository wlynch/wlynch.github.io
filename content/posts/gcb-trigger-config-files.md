---
title: "Cloud Build Trigger Cookbook"
date: 2019-10-22T10:19:44-04:00
---

[Cloud Build (GCB) Triggers](https://cloud.google.com/cloud-build/docs/running-builds/automate-builds) allows users to define triggers to automatically trigger builds on certain events with source code providers.

Here are some examples to help get you started!

<!--more-->

## gcloud CLI

While GCB provides an
[API](https://cloud.google.com/cloud-build/docs/api/reference/rest/v1/projects.triggers#BuildTrigger)
for managing Trigger configurations, there are also [gcloud
commands](https://cloud.google.com/sdk/gcloud/reference/beta/builds/triggers/)
to make managing triggers a bit easier.

In particular, [`gcloud beta builds triggers
import`](https://cloud.google.com/sdk/gcloud/reference/beta/builds/triggers/import)
allows you to manipulate Build Triggers specified in a file.

```sh
$ cat trigger.yaml
name: "github-pr"
github:
  owner: "wlynch"
  name: "test"
  pull_request:
    branch: "master"
filename: "cloudbuild.yaml"
$ gcloud beta builds triggers import --source=trigger.yaml
---
createTime: '2019-10-22T16:14:12.096958268Z'
filename: cloudbuild.yaml
github:
  name: test
  owner: wlynch
  pullRequest:
    branch: master
id: 475855d2-7367-4c7a-9fa5-4217925df992
name: github-pr
```

The file should contain a YAML or JSON formatted
[`BuildTrigger`](https://cloud.google.com/cloud-build/docs/api/reference/rest/v1/projects.triggers#BuildTrigger).
You can even specify multiple Trigger documents in the same file!

## Cookbook

### Trigger substitutions

Triggers can provide substitutions that will merge with any specified build
substitutions. This can be useful for sharing the same build configuration file
across multiple triggers, but providing trigger specific values (for example,
environment-specific values).

```yaml
name: "github-pr"
github:
  owner: "wlynch"
  name: "test"
  push:
    branch: ".*"
substitutions:
  _MYSUB: "foo"
filename: "cloudbuild.yaml"
```

### Pull Request with comment control enabled

This trigger allows for builds only to be can if a repository collaborator
comments on the PR with `/gcbrun`, preventing unwanted builds to be ran in your
project unless they have been vetted by a collaborator.

```yaml
name: "github-pr"
github:
  owner: "wlynch"
  name: "test"
  pull_request:
    comment_control: "COMMENTS_ENABLED"
    branch: ".*"
filename: "cloudbuild.yaml"
```

### Push to CSR repo, ignore changes to `docs/`

This trigger allows you to skip builds if there have only been changes to files
under the `docs/` directory.

```yaml
name: "push-ignore-doc"
trigger_template:
  repo_name: "test"
  branch_name: ".*"
ignored_files:
  - "docs/**"
build:
  steps:
    - name: "gcr.io.cloud-builders.docker"
      args:
        - "build"
        - "-t"
        - "gcr.io/wlynch-test/test:$COMMIT_SHA"
        - "."
  images:
    - "gcr.io/wlynch-test/test:$COMMIT_SHA"
```

### Multiple configs per file

This trigger specifies multiple triggers in a single file.

Configs are evaluated sequentially, so if multiple configs share the same
identifier (i.e.. `trigger.id` or `trigger.name`), then the last one will win.

```yaml
name: "github-push"
github:
  owner: "wlynch"
  name: "test"
  push:
    branch: "^master$"
filename: "cloudbuild.yaml"
---
name: "github-pr"
github:
  owner: "wlynch"
  name: "test"
  pull_request:
    comment_control: "COMMENTS_ENABLED"
    branch: ".*"
filename: "cloudbuild.yaml"
```

### JSON Configuration

This trigger config specifies the trigger as JSON instead of YAML.

```json
{
  "name": "github-pr",
  "github": {
    "owner": "wlynch",
    "name": "test",
    "push": {
      "branch": ".*"
    }
  },
  "filename": "cloudbuild.yaml"
}
```

## Related Docs

* [Cloud Build Triggers API](https://cloud.google.com/cloud-build/docs/api/reference/rest/v1/projects.triggers#BuildTrigger)
* [Cloud Builds Triggers gcloud CLI](https://cloud.google.com/sdk/gcloud/reference/beta/builds/triggers/)
