#!/bin/bash
# Script to push to GitHub

echo "Pushing to GitHub..."
echo "Repository: https://github.com/burakbilgehan/mortgage-calculator-nl.git"
echo ""
echo "If prompted for credentials:"
echo "  Username: burakbilgehan"
echo "  Password: Use a Personal Access Token (not your GitHub password)"
echo ""
echo "To create a token:"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Generate new token (classic)"
echo "  3. Select 'repo' permissions"
echo "  4. Copy the token and use it as password"
echo ""

git push -u origin main

