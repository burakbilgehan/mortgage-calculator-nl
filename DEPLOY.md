# Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `mortgage-calculator-nl`
3. Description: "Mortgage Calculator for Netherlands with inflation adjustments"
4. Make it **Public** (required for free GitHub Pages)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push to GitHub

Run these commands (or I can run them for you):

```bash
git remote add origin https://github.com/burakkaanbilgehan/mortgage-calculator-nl.git
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/burakkaanbilgehan/mortgage-calculator-nl
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Source: **GitHub Actions**
4. The GitHub Actions workflow will automatically deploy your site!

## Your Live Site

After the GitHub Actions workflow completes (takes ~2 minutes), your site will be available at:

**https://burakkaanbilgehan.github.io/mortgage-calculator-nl/**

## Future Updates

Just commit and push to main branch:
```bash
git add .
git commit -m "Your commit message"
git push
```

The site will automatically update via GitHub Actions!

