#!/bin/bash

jsonFile="./envTemplate.json"
outputFile="../.env"

# Flatten the JSON file into key=value format
flat_json=$(jq -r 'to_entries | .[] | "\(.key)=\(.value|tostring)"' "$jsonFile")

# Write to output file
echo "$flat_json" > "$outputFile"

# Optionally, print the output file content
cat "$outputFile"
