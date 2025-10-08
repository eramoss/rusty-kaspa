#!/bin/bash

BASE_RPC=16110

if [ $# -lt 2 ]; then
    echo "Usage: $0 <num_nodes> <addr1> [addr2] [addr3] ..."
    exit 1
fi

NODES=$1
shift 

MINING_ADDRESSES=("$@")

if [ "$NODES" -ne "${#MINING_ADDRESSES[@]}" ]; then
    echo "❌ Error: number of nodes ($NODES) does not match number of addresses (${#MINING_ADDRESSES[@]})."
    exit 1
fi

echo "$NODES ${MINING_ADDRESSES[@]}" > mining_input.txt

for i in $(seq 1 $NODES); do
    RPC=$((BASE_RPC + (i-1)*10))
    MINING_ADDR=${MINING_ADDRESSES[$((i-1))]}

    kaspa-miner \
        --mining-address "$MINING_ADDR" \
        --kaspad-address 127.0.0.1 \
        -p "$RPC" \
        --mine-when-not-synced &

    echo "✅ Started miner for node $i with address $MINING_ADDR"
done

echo "🚀 All $NODES miners started successfully."
