# DNS Configuration for apophis.bot

This document provides step-by-step instructions for configuring DNS on **Namecheap** to point `apophis.bot` to GitHub Pages.

---

## Step-by-Step: Namecheap DNS Configuration

### Step 1: Log in to Namecheap

1. Go to https://www.namecheap.com/
2. Click **Sign In** (top right)
3. Enter your username and password

### Step 2: Access Domain Management

1. Click on **Domain List** in the left sidebar
2. Find `apophis.bot` in your domain list
3. Click the **MANAGE** button next to apophis.bot

### Step 3: Configure DNS Settings

1. Scroll down to the **NAMESERVERS** section
2. Make sure it's set to **Namecheap BasicDNS** (or **Custom DNS** if you prefer)
3. Click on the **Advanced DNS** tab at the top

### Step 4: Remove Default Records (if present)

You may see some default records. Remove these if they exist:

- Any existing A records for `@`
- Any existing CNAME records for `www`
- Parking page records

To remove: Click the trash icon (🗑️) next to each record

### Step 5: Add A Records for Apex Domain

Click **ADD NEW RECORD** and add these **4 A Records** one by one:

**Record 1:**

- Type: `A Record`
- Host: `@`
- Value: `185.199.108.153`
- TTL: `Automatic` (or `1 min` for faster testing)

**Record 2:**

- Type: `A Record`
- Host: `@`
- Value: `185.199.109.153`
- TTL: `Automatic`

**Record 3:**

- Type: `A Record`
- Host: `@`
- Value: `185.199.110.153`
- TTL: `Automatic`

**Record 4:**

- Type: `A Record`
- Host: `@`
- Value: `185.199.111.153`
- TTL: `Automatic`

### Step 6: Add AAAA Records for IPv6 (Optional but Recommended)

Click **ADD NEW RECORD** and add these **4 AAAA Records** one by one:

**Record 1:**

- Type: `AAAA Record`
- Host: `@`
- Value: `2606:50c0:8000::153`
- TTL: `Automatic`

**Record 2:**

- Type: `AAAA Record`
- Host: `@`
- Value: `2606:50c0:8001::153`
- TTL: `Automatic`

**Record 3:**

- Type: `AAAA Record`
- Host: `@`
- Value: `2606:50c0:8002::153`
- TTL: `Automatic`

**Record 4:**

- Type: `AAAA Record`
- Host: `@`
- Value: `2606:50c0:8003::153`
- TTL: `Automatic`

### Step 7: Add CNAME for www Subdomain (REQUIRED)

To make `www.apophis.bot` work alongside `apophis.bot`:

Click **ADD NEW RECORD**:

- Type: `CNAME Record`
- Host: `www`
- Value: `wilneeley.github.io.` (⚠️ **include the trailing dot**)
- TTL: `Automatic`

Click the **✓** checkmark to save.

### Step 8: Save Changes

1. Click the **✓** (checkmark) or **Save** button for each record
2. Namecheap will automatically save your changes

### Final DNS Configuration

Your Advanced DNS page should now show **9 records total**:

```
Type    Host    Value                       TTL
────────────────────────────────────────────────────────
A       @       185.199.108.153             Automatic
A       @       185.199.109.153             Automatic
A       @       185.199.110.153             Automatic
A       @       185.199.111.153             Automatic
AAAA    @       2606:50c0:8000::153         Automatic
AAAA    @       2606:50c0:8001::153         Automatic
AAAA    @       2606:50c0:8002::153         Automatic
AAAA    @       2606:50c0:8003::153         Automatic
CNAME   www     wilneeley.github.io.        Automatic
```

✅ **Both `apophis.bot` and `www.apophis.bot` will now work!**

---

## Step 9: Configure GitHub Pages

Now that DNS is configured, set up GitHub Pages:

1. Go to your repository settings: https://github.com/wilneeley/99942-apophis/settings/pages
2. Under **"Custom domain"**, enter: `apophis.bot` (⚠️ **use apex domain, not www**)
3. Click **Save**
4. Wait a few minutes, then check **"Enforce HTTPS"**
    - ⚠️ This option may be grayed out initially - wait for DNS to propagate
    - GitHub needs to provision an SSL certificate (can take 10-60 minutes)
5. The CNAME file in the `public/` directory will be automatically deployed

### Important Notes:

- ✅ The CNAME file already exists in `public/CNAME` with content: `apophis.bot`
- ✅ GitHub Actions will automatically deploy it
- ✅ **Both `apophis.bot` and `www.apophis.bot` will work** (GitHub handles www redirect automatically)
- ⚠️ Don't delete the CNAME file from the repository
- ⚠️ If you redeploy, GitHub may uncheck the custom domain - just re-enter it
- ⚠️ **Only enter `apophis.bot` in GitHub Pages settings** (not www.apophis.bot)

---

## Step 10: Verification

### Check DNS Propagation (5-30 minutes)

1. Go to: https://www.whatsmydns.net/#A/apophis.bot
2. You should see the 4 GitHub Pages IP addresses
3. Green checkmarks = DNS has propagated in that region
4. ⏱️ Full global propagation can take up to 48 hours

### Test Your Site

1. Open a browser in **incognito/private mode** (to avoid cache)
2. Test the apex domain: http://apophis.bot (without https first)
3. Test the www subdomain: http://www.apophis.bot
4. You should see your site on both!
5. Once HTTPS is enabled in GitHub Pages:
    - Test: https://apophis.bot
    - Test: https://www.apophis.bot
    - Both should work and show the 🔒 padlock icon
6. GitHub automatically redirects www to apex (or vice versa) - both URLs work!

### Verify HTTPS Certificate

1. Click the padlock icon in your browser
2. Click "Certificate" or "Connection is secure"
3. Should show a valid certificate issued by GitHub

---

## Troubleshooting

### DNS Not Propagating

- ⏱️ **Wait**: Can take 5 minutes to 48 hours
- 🔄 **Flush DNS cache** on your computer:
    - **Mac**: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
    - **Windows**: `ipconfig /flushdns`
    - **Linux**: `sudo systemd-resolve --flush-caches`
- 🌐 **Check globally**: Use https://www.whatsmydns.net/

### "Domain's DNS record could not be retrieved" in GitHub

- ⏱️ **Wait 10-30 minutes** after adding DNS records
- ✅ **Verify A records** are correct in Namecheap Advanced DNS
- 🔄 **Try removing and re-adding** the custom domain in GitHub Pages settings

### HTTPS Certificate Error

- ⏱️ **Wait up to 24 hours** for GitHub to provision the certificate
- ✅ **Ensure DNS is fully propagated** before enabling HTTPS
- 🔄 **Try unchecking and re-checking** "Enforce HTTPS" after waiting

### 404 Error

- ✅ **Check CNAME file** exists in `public/CNAME` with content: `apophis.bot`
- 🚀 **Redeploy**: Push a commit to trigger GitHub Actions
- 📋 **Check GitHub Actions**: Go to https://github.com/wilneeley/99942-apophis/actions
- ✅ **Verify deployment succeeded** (green checkmark)

### Site Shows Old Content

- 🧹 **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- 🕵️ **Use incognito mode**: Ctrl+Shift+N (or Cmd+Shift+N on Mac)
- ⏱️ **Wait for CDN**: GitHub Pages uses a CDN, can take 5-10 minutes to update

### www.apophis.bot Not Working

- ✅ **Verify CNAME record** exists in Namecheap Advanced DNS:
    - Type: `CNAME Record`
    - Host: `www`
    - Value: `wilneeley.github.io.` (with trailing dot)
- ⏱️ **Wait for DNS propagation** (check https://www.whatsmydns.net/#CNAME/www.apophis.bot)
- ✅ **Verify apex domain** is set in GitHub Pages (not www)
- 🔄 **GitHub handles www redirect automatically** - no need to add www separately

---

## Quick Reference: GitHub Pages IP Addresses

**A Records (IPv4):**

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**AAAA Records (IPv6):**

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

---

## Current Repository Configuration

- ✅ CNAME file created in `public/CNAME`
- ✅ Next.js config updated (removed basePath)
- ✅ Package.json updated with homepage URL
- ✅ README.md updated with custom domain
- ✅ Metadata updated in layout.tsx
- ✅ robots.txt created for SEO
- ✅ About modal updated with domain branding
- ✅ Favicons and logos created
- ✅ Open Graph image for social media

---

## Timeline Expectations

| Step                           | Expected Time         |
| ------------------------------ | --------------------- |
| DNS records added in Namecheap | Immediate             |
| DNS propagation starts         | 5-10 minutes          |
| DNS visible on whatsmydns.net  | 10-30 minutes         |
| GitHub detects DNS             | 10-60 minutes         |
| HTTPS certificate provisioned  | 30 minutes - 24 hours |
| Full global DNS propagation    | Up to 48 hours        |

**Typical total time: 30 minutes to 2 hours** for everything to work with HTTPS.

---

## References

- [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages IP Addresses](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)
- [Namecheap DNS Management Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

---

## Need Help?

If you encounter issues not covered in the troubleshooting section:

1. **Check GitHub Actions logs**: https://github.com/wilneeley/99942-apophis/actions
2. **Verify DNS records**: https://www.whatsmydns.net/#A/apophis.bot
3. **Check GitHub Pages status**: https://www.githubstatus.com/
4. **Namecheap support**: https://www.namecheap.com/support/

**Most issues resolve themselves with patience - wait at least 1 hour before troubleshooting!**
