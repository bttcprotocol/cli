# Matic CLI

🏗 A CLI to setup and manage Matic validator nodes 

### Installation

```bash
npm install -g @maticnetwork/matic-cli
```

Please make sure you have installed following dependencies:

* Git
* Node/npm v10.17.0 (or higher)
* Go 1.13+
* Rabbitmq (Latest stable version)
* Solc v0.5.11 (https://solidity.readthedocs.io/en/v0.5.3/installing-solidity.html#binary-packages)
* Ganache CLI (https://www.npmjs.com/package/ganache-cli)

### Usage

Create new directory for the setup:

```bash
$ mkdir localnet
$ cd localnet
```

**Check commands**

```bash
matic-cli
```

**To setup 1 node local network**

This will setup Delivery and Bttc.

```bash
matic-cli setup localnet
```

It will ask you several questions:

```
Please enter Bttc chain id - You can keep the default one (15001) or change it to any numeric id
Please enter Delivery chain id - You can keep the default one (Delivery-15001) or change it to a regex (Delivery-<numeric id>)
Please enter Bttc branch or tag - v0.2.5
Please enter Delivery branch or tag - v0.2.1-mumbai
Please enter Contracts branch or tag - Keep the default branch (v0.3.0-backport)
```

After the setup is done, follow these steps:

Start ganache
```bash
bash ganache-start.sh
```

Start delivery
```bash
bash delivery-start.sh
```

Start delivery bridge
```bash
bash delivery-bridge-start.sh
```

Start delivery rest server
```bash
bash delivery-server-start.sh
```

Setup Bttc
```bash
bash bttc-setup.sh
```

Start bttc
```bash
bash bttc-start.sh
```

**To setup multi-node local network**

```bash
matic-cli setup devnet
```

It will ask you several questions:

```
Please enter Bttc chain id - You can keep the default one (15001) or change it to any numeric id
Please enter delivery chain id - You can keep the default one (delivery-15001) or change it to a regex (delivery-<numeric id>)
Please enter Bttc branch or tag - v0.2.5
Please enter delivery branch or tag - v0.2.1-mumbai
Please enter Contracts branch or tag - Keep the default branch (v0.3.0-backport)
Please enter number of validator nodes - Input the number of validator nodes you want to run
Please enter number of non-validator nodes - Input the number of sentry nodes you want to run
Please enter ETH url - http://ganache:9545
Please select devnet type - docker (for docker setup)
```

After the setup is done, follow these steps:

Start ganache
```bash
bash docker-ganache-start.sh
```

Start all delivery instances (it will run all services - rabbitmq, delivery, bridge, server)
```bash
bash docker-delivery-start-all.sh
```

Setup bttc
```bash
bash docker-bttc-setup.sh
```

Start bttc
```bash
bash docker-bttc-start-all.sh
```

**Logs**

Logs will be at `logs/` folder

**SSH to docker containers through tmux**

For delivery

```bash
bash docker-delivery-tmux.sh
```

For  bttc

```bash
bash docker-bttc-tmux.sh
```

**Clean Setup**
Remove the localnet folder and you can start the process once again

## License

MIT
