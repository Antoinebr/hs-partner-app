#!/bin/bash

# Retrieve changes made to the db.sql file
changes=$(git diff --name-only db/db.sqlite)

# Check if any changes have been made to the file
if [ -n "$changes" ]; then
  # Add the db.sql file to Git's tracked files
  git add db/db.sqlite

  # Create the commit with a message describing the changes made
  git commit -m "DB sync"
  echo "The DB has been updated and synced to GitHub"
else
  # Display a message indicating that the file has not been modified
  echo "No changes were made to the DB"
fi