#!/bin/bash
sudo tc qdisc del dev lo root 2>/dev/null
killall -9 kaspad
killall -9 kaspa-miner
rm -rf ./target/node*

