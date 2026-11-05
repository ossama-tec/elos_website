// ═══════════════════════════════════════════════════════════════
//  إعدادات صفحة التحميل — https://elos-system.com/download
//  ده المكان الوحيد اللي بيتعدّل مع كل إصدار. الصفحة نفسها مش محتاجة تتلمس.
//  release.ps1 (في elos-accounting) بيحدّث version + windows.* أوتوماتيك مع كل ريليز.
//  ⚠️ اللينك ده بيتبعت من تطبيق الموبايل (ELOS 5.0) في واتساب — متغيّرش اسم الصفحة.
// ═══════════════════════════════════════════════════════════════
window.ELOS_DOWNLOAD = {
  version: '4.1.0',

  windows: {
    url: 'https://github.com/ossama-tec/elos_website/releases/download/v4.1.0/ELOS-Accounting-V4-4.1.0-Setup.zip',                                   // لينك الـinstaller المباشر ('#' = الزرار مقفول)
    fileName: 'ELOS-Accounting-V4-4.1.0-Setup.zip',
    size: '98.8 MB',                               // مثال: '128 MB'
    date: '2026-11-05'                          // تاريخ الإصدار YYYY-MM-DD
  },

  // تطبيق الموبايل — لو اللينك فاضي ('') الزرار بيختفي
  googlePlay: 'https://play.google.com/store/apps/details?id=com.elos.accounting',

  // رقم واتساب الدعم (دولي من غير +)
  supportWhatsApp: '201550320914'
};
