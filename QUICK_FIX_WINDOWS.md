# 🪟 راه‌حل سریع برای Windows

## ❌ مشکلات شناسایی شده:

1. **Docker Desktop در حال اجرا نیست**
2. **Git Bash با setup.bat کار نمی‌کنه**

---

## ✅ راه‌حل (3 گام ساده):

### گام 1️⃣: Docker Desktop رو باز کن

1. **Start Menu** رو باز کن
2. تایپ کن: `Docker Desktop`
3. روی **Docker Desktop** کلیک کن
4. صبر کن تا Docker کاملاً اجرا بشه (آیکون Docker در System Tray سبز یا آبی بشه)

**نکته مهم**: این کار 30 ثانیه تا 1 دقیقه طول می‌کشه. صبور باش! ⏳

---

### گام 2️⃣: چک کن Docker آماده هست

در Git Bash این دستور رو بزن:

```bash
docker --version
```

اگه نسخه Docker رو نشون داد، آماده‌ای! ✅

---

### گام 3️⃣: ایجاد فایل .env و اجرا

#### روش A: دستی (ساده‌ترین)
```bash
# ایجاد backend/.env
cp backend/.env.example backend/.env

# اجرا
docker-compose up --build
```

#### روش B: با اسکریپت (در Git Bash)
```bash
# اجرای اسکریپت Linux
bash setup.sh

# بعد اجرا
docker-compose up --build
```

#### روش C: از CMD یا PowerShell استفاده کن
```cmd
# باز کردن CMD یا PowerShell در همین پوشه
# بعد:
setup.bat
docker-compose up --build
```

---

## 🎯 خلاصه دستورات (کپی-پیست کن):

```bash
# چک کردن Docker
docker --version

# ایجاد .env
cp backend/.env.example backend/.env

# اجرا!
docker-compose up --build
```

---

## ⏱️ زمان مورد نیاز:

- راه‌اندازی Docker Desktop: 30 ثانیه - 1 دقیقه
- ایجاد .env: 1 ثانیه
- Build اولیه: 3-5 دقیقه
- دفعات بعدی: 10-30 ثانیه

---

## 🔍 چک کردن وضعیت Docker

```bash
# چک کردن نسخه
docker --version

# لیست containers (باید خالی باشه در ابتدا)
docker ps

# تست ساده
docker run hello-world
```

اگه `hello-world` اجرا شد، Docker درست کار می‌کنه! ✅

---

## 🐛 اگه باز هم مشکل داشتی:

### مشکل: "Cannot connect to Docker daemon"
**حل**: 
1. Docker Desktop رو کاملاً ببند
2. دوباره باز کن
3. 1-2 دقیقه صبر کن
4. دوباره امتحان کن

### مشکل: "Port 8080 is already in use"
**حل**:
```bash
# پیدا کردن process
netstat -ano | findstr :8080

# Kill کردن
taskkill /PID [شماره PID] /F
```

### مشکل: Docker خیلی کند است
**حل**:
1. باز کردن Docker Desktop
2. Settings → Resources → Memory
3. حداقل 4GB اختصاص بده
4. Apply & Restart

---

## ✅ موفقیت!

وقتی این پیام‌ها رو دیدی، یعنی آماده‌ست:

```
boltai_backend | INFO:     Uvicorn running on http://0.0.0.0:8000
boltai_web     | /docker-entrypoint.sh: Configuration complete
```

حالا برو به: **http://localhost:8080**

---

## 📞 کمک بیشتر

اگه گیر کردی، screenshot از error بگیر و Issue باز کن:
https://github.com/aminchedo/BoltAiCrypto/issues
