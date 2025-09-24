#!/bin/bash
NODES=10
BASE_P2P=16111
BASE_RPC=16110
BASE_BORSH=16112

for i in $(seq 1 $NODES); do
    RPC=$((BASE_RPC + (i-1)*10))
    
    kaspa-miner \
        --mining-address kaspadev:qqfg58vqsma3g0qss4uq7y3rxku0esy62qvkuyjup6l9vd8mrv8tx0z3j92wr \
        --kaspad-address 127.0.0.1 \
        -p $RPC \
        --mine-when-not-synced &
    
    echo "Started miner for node $i"
done

echo "All miners started."
