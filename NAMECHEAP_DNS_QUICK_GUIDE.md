# Namecheap DNS Quick Setup Guide for apophis.bot

## 🎯 Goal

Make both `apophis.bot` and `www.apophis.bot` work with your GitHub Pages site.

---

## 📋 Exact DNS Records to Add in Namecheap

### Go to: Namecheap → Domain List → apophis.bot → MANAGE → Advanced DNS

### Add These 9 Records:

#### 4 A Records (for apophis.bot):

```
Type: A Record    Host: @    Value: 185.199.108.153    TTL: Automatic
Type: A Record    Host: @    Value: 185.199.109.153    TTL: Automatic
Type: A Record    Host: @    Value: 185.199.110.153    TTL: Automatic
Type: A Record    Host: @    Value: 185.199.111.153    TTL: Automatic
```

#### 4 AAAA Records (for IPv6 - optional but recommended):

```
Type: AAAA Record    Host: @    Value: 2606:50c0:8000::153    TTL: Automatic
Type: AAAA Record    Host: @    Value: 2606:50c0:8001::153    TTL: Automatic
Type: AAAA Record    Host: @    Value: 2606:50c0:8002::153    TTL: Automatic
Type: AAAA Record    Host: @    Value: 2606:50c0:8003::153    TTL: Automatic
```

#### 1 CNAME Record (for www.apophis.bot):

```
Type: CNAME Record    Host: www    Value: wilneeley.github.io.    TTL: Automatic
```

⚠️ **Important**: Include the trailing dot after `.io.`

---

## ⚙️ GitHub Pages Settings

### Go to: https://github.com/wilneeley/99942-apophis/settings/pages

1. **Custom domain**: Enter `apophis.bot` (NOT www.apophis.bot)
2. Click **Save**
3. Wait 10-30 minutes
4. Check **Enforce HTTPS**

✅ GitHub will automatically handle www redirect!

---

## ✅ What Will Work

After DNS propagates (10-60 minutes):

- ✅ `http://apophis.bot` → Works
- ✅ `http://www.apophis.bot` → Works (redirects to apex)
- ✅ `https://apophis.bot` → Works (after HTTPS enabled)
- ✅ `https://www.apophis.bot` → Works (after HTTPS enabled)

---

## 🧪 Test DNS Propagation

- **Apex domain**: https://www.whatsmydns.net/#A/apophis.bot
- **WWW subdomain**: https://www.whatsmydns.net/#CNAME/www.apophis.bot

Look for green checkmarks around the world!

---

## ⏱️ Timeline

| Step                         | Time              |
| ---------------------------- | ----------------- |
| Add DNS records in Namecheap | Immediate         |
| DNS propagation              | 10-30 minutes     |
| GitHub detects DNS           | 10-60 minutes     |
| HTTPS certificate            | 30 min - 24 hours |

**Total: 30 minutes to 2 hours typically**

---

## 🚨 Common Mistakes to Avoid

❌ **DON'T** enter `www.apophis.bot` in GitHub Pages custom domain
✅ **DO** enter `apophis.bot` (apex domain only)

❌ **DON'T** forget the trailing dot in CNAME value
✅ **DO** use `wilneeley.github.io.` (with dot at end)

❌ **DON'T** use `apophis.bot` as the CNAME value
✅ **DO** use `wilneeley.github.io.` as the CNAME value

❌ **DON'T** add A records for www
✅ **DO** add CNAME record for www

---

## 📸 What Your Namecheap Advanced DNS Should Look Like

```
┌─────────────────────────────────────────────────────────────┐
│ Advanced DNS for apophis.bot                                │
├─────────────────────────────────────────────────────────────┤
│ Type    │ Host │ Value                    │ TTL       │ 🗑️ │
├─────────────────────────────────────────────────────────────┤
│ A       │ @    │ 185.199.108.153          │ Automatic │ 🗑️ │
│ A       │ @    │ 185.199.109.153          │ Automatic │ 🗑️ │
│ A       │ @    │ 185.199.110.153          │ Automatic │ 🗑️ │
│ A       │ @    │ 185.199.111.153          │ Automatic │ 🗑️ │
│ AAAA    │ @    │ 2606:50c0:8000::153      │ Automatic │ 🗑️ │
│ AAAA    │ @    │ 2606:50c0:8001::153      │ Automatic │ 🗑️ │
│ AAAA    │ @    │ 2606:50c0:8002::153      │ Automatic │ 🗑️ │
│ AAAA    │ @    │ 2606:50c0:8003::153      │ Automatic │ 🗑️ │
│ CNAME   │ www  │ wilneeley.github.io.     │ Automatic │ 🗑️ │
└─────────────────────────────────────────────────────────────┘
```

**9 records total** ✅

---

## 🆘 Quick Troubleshooting

**Problem**: DNS not propagating

- **Solution**: Wait 30-60 minutes, flush DNS cache

**Problem**: GitHub says "DNS record could not be retrieved"

- **Solution**: Wait 30 minutes after adding records, verify A records are correct

**Problem**: HTTPS not working

- **Solution**: Wait up to 24 hours for certificate, ensure DNS is fully propagated first

**Problem**: www not working

- **Solution**: Verify CNAME record exists with trailing dot: `wilneeley.github.io.`

---

## 📞 Need More Help?

See the full guide: `DNS_SETUP.md`
