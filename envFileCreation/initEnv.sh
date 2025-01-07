#!/bin/bash

source_file="envTemplate.txt"
target_file="../.env"

if [[ ! -f $source_file ]]; then
  echo "Error: Source file $source_file does not exist."
  exit 1
fi

cat "$source_file" > "$target_file"

echo "Contents of $source_file have been copied to $target_file."
