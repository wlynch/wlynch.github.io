---
layout: post
title: Disabling MotD for PDSH
---

My friend V [introduced me](http://vverma.net/use-pdsh-to-shell-into-multiple-hosts.html) to an awesome tool called PDSH. One thing that really bothered me was when logging in to machines that had a message of the day, my screen would be flooded with messages, burying the information I needed. 

Here's how to disable MotD from appearing in the output of PDSH. In your `~/.bashrc` include:

```
export PDSH_SSH_ARGS_APPEND=-oLogLevel=Error
```

### Edit:
