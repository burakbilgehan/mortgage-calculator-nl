# Deployment Instructions

## Repository URL
**https://github.com/burakbilgehan/mortgage-calculator-nl**

## Step 1: Push to GitHub

The remote is already configured. You need to push with authentication.

### Option A: Using Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: "mortgage-calculator"
   - Select scope: **repo** (all repo permissions)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push your code:**
   ```bash
   git push -u origin main
   ```
   - Username: `burakbilgehan`
   - Password: **Paste your Personal Access Token** (not your GitHub password!)

### Option B: Use the Helper Script

```bash
./push.sh
```

This will guide you through the push process.

## Step 2: Enable GitHub Pages

1. Go to your repository: https://github.com/burakbilgehan/mortgage-calculator-nl
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select:
   - Source: **GitHub Actions**
4. Save the settings

The GitHub Actions workflow will automatically deploy your site on every push!

## Your Live Site

After the GitHub Actions workflow completes (takes ~2 minutes), your site will be available at:

**https://burakbilgehan.github.io/mortgage-calculator-nl/**

## Future Updates

Just commit and push to main branch:
```bash
git add .
git commit -m "Your commit message"
git push
```

The site will automatically update via GitHub Actions!

