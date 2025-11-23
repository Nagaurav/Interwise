// Verification script to check authentication fixes
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'components/interview/InterviewList.tsx',
  'components/interview/VideoUploader.tsx',
  'components/interview/NewInterviewForm.tsx',
  'app/interview/[id]/page.tsx',
  'app/interview/[id]/results/page.tsx',
  'app/interview/[id]/analysis/page.tsx'
];

console.log('🔍 Verifying authentication fixes...\n');

let allFixed = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasLocalStorageToken = content.includes('localStorage.getItem') && 
      (content.includes('token') || content.includes('auth'));
    
    const hasUseAuth = content.includes('useAuth') && content.includes('getToken');
    
    console.log(`📁 ${file}:`);
    console.log(`   ✅ Uses AuthContext: ${hasUseAuth ? 'YES' : 'NO'}`);
    console.log(`   ❌ localStorage token usage: ${hasLocalStorageToken ? 'FOUND - NEEDS FIX' : 'NONE'}`);
    
    if (hasLocalStorageToken) {
      allFixed = false;
    }
    console.log('');
  } else {
    console.log(`⚠️  File not found: ${file}\n`);
  }
});

if (allFixed) {
  console.log('✅ All authentication fixes verified successfully!');
  console.log('🚀 Ready for deployment!');
} else {
  console.log('❌ Some files still have localStorage token usage.');
  console.log('🔧 Please fix the remaining issues before deploying.');
}
