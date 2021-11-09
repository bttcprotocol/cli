# Devnet

### Run multiple delivery nodes

```bash
# start delivery0
$ docker-compose up -d delivery0

# exec bash into delivery0
$ docker exec -i -t delivery0 bash
```

**To access bash for all nodes**

```bash
$ tmux
$ bash tmux-docker.sh
```

**To read logs**

On docker container's shell:

```bash
$ tail -f /root/delivery/logs/deliveryd.log
```

### Run multiple bttc nodes

```bash
# setup all nodes
$ bash docker-bttc-setup.sh

# start node
$ bash docker-bttc-start.sh 0 # for node 0

# start all nodes at once
$ bash docker-bttc-start-all.sh
```

### Clean Heimdall/bttc data and start fresh

```bash
$ bash docker-clean.sh
```