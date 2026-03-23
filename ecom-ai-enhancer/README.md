# VisualCommerce AI 🛍️✨

An AI-powered e-commerce product enhancer. Upload any product photo and instantly get:

- 🔍 **AI product analysis** (exact details preserved)
- ✍️ **SEO-optimized title** (70 chars, keyword-rich)
- 📝 **SEO description** (120–160 chars, conversion-focused)
- 📸 **3 AI-generated images**:
  - Professional studio shot (white bg, perfect lighting)
  - Model try-on (fashion editorial style)
  - Lifestyle photo (real-world aspirational)

Built with **Next.js 14**, **Hugging Face Inference API**, and a dark modern UI.

---

## 🚀 Deploy to Vercel (5 minutes)

### Step 1 — Get a Hugging Face API Key

1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to **Settings → Access Tokens**
3. Create a new token with `read` permission
4. Copy the token

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ecom-ai-enhancer.git
git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. In **Environment Variables**, add:
   - Key: `HUGGINGFACE_API_KEY`
   - Value: `your_hf_token_here`
4. Click **Deploy** 🎉

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your HUGGINGFACE_API_KEY

# 3. Run dev server
npm run dev

# Open http://localhost:3000
```

---

## 🏗️ Project Structure

```
ecom-ai-enhancer/
├── src/
│   └── app/
│       ├── page.tsx              # Main UI
│       ├── layout.tsx            # Root layout
│       ├── globals.css           # Dark modern styles
│       └── api/
│           ├── analyze/
│           │   └── route.ts      # Vision + SEO generation
│           └── generate-images/
│               └── route.ts      # SDXL image generation
├── .env.local.example            # Env template
├── vercel.json                   # Vercel config
└── README.md
```

---

## 🤖 AI Models Used

| Task | Model |
|------|-------|
| Product vision analysis | `Salesforce/blip-image-captioning-large` |
| SEO content generation | `mistralai/Mistral-7B-Instruct-v0.3` |
| Image generation | `stabilityai/stable-diffusion-xl-base-1.0` |

All models run via the **Hugging Face Inference API** — no GPU needed.

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `HUGGINGFACE_API_KEY` | Your HF token from huggingface.co/settings/tokens |

> ⚠️ **Never commit `.env.local` to GitHub.** It's already in `.gitignore`.

---

## 📜 License

MIT — free to use, modify, and deploy.
