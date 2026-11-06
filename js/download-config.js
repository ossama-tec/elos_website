// ═══════════════════════════════════════════════════════════════
//  إعدادات صفحة التحميل — https://elos-system.com/download
//  ده المكان الوحيد اللي بيتعدّل مع كل إصدار. الصفحة نفسها مش محتاجة تتلمس.
//  release.ps1 (في elos-accounting) بيحدّث version + windows.* أوتوماتيك مع كل ريليز.
//  ⚠️ اللينك ده بيتبعت من تطبيق الموبايل (ELOS 5.0) في واتساب — متغيّرش اسم الصفحة.
// ═══════════════════════════════════════════════════════════════
window.ELOS_DOWNLOAD = {
  version: '4.1.1',

  windows: {
    url: 'https://github.com/ossama-tec/elos_website/releases/download/v4.1.1/ELOS-Accounting-V4-4.1.1-Setup.zip',                                   // لينك الـinstaller المباشر ('#' = الزرار مقفول)
    fileName: 'ELOS-Accounting-V4-4.1.1-Setup.zip',
    size: '99 MB',                               // مثال: '128 MB'
    date: '2026-11-06'                          // تاريخ الإصدار YYYY-MM-DD
  },

  // 🍎 نسخة الماك — release-mac.ps1 (في elos-accounting) بيحدّث اللينكين دول مع كل ريليز.
  //    لو الاتنين فاضيين ('') الكارت بيرجع «قريبًا».
  //    ⚠️ ممنوع تتسمّى url/version/size/date/fileName — release.ps1 بيستبدل
  //    أي مفتاح بالأسماء دي بلينك الويندوز.
  mac: {
    arm64: 'https://github.com/ossama-tec/elos_website/releases/download/v4.1.1/ELOS-Accounting-V4-4.1.1-arm64.dmg',
    intel: 'https://github.com/ossama-tec/elos_website/releases/download/v4.1.1/ELOS-Accounting-V4-4.1.1-x64.dmg'
  },

  // تطبيق الموبايل — لو اللينك فاضي ('') الزرار بيختفي
  googlePlay: 'https://play.google.com/store/apps/details?id=com.elos.accounting',

  // رقم واتساب الدعم (دولي من غير +)
  supportWhatsApp: '201550320914'
};
