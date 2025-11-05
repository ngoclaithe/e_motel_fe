const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/(dashboard)/motels/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the image mapping section
const oldPattern = /\{form\.images\.map\(\(img, idx\) => \(\s*<div key=\{idx\}[^}]*className="group relative rounded-lg overflow-hidden bg-black\/10 dark:bg-white\/10">\s*<img src=\{img\}[^}]*className="w-full h-20 object-cover"[^}]*\/>\s*<button[\s\S]*?removeImage\(idx\)[\s\S]*?✕[\s\S]*?<\/button>\s*<\/div>\s*\)\)\}/;

const newContent = `{form.images.map((img, idx) => {
                          const imgUrl = typeof img === 'string' ? img : (img && typeof img === 'object' ? (img as any).url : '');
                          return (
                            <div key={idx} className="group relative rounded-lg overflow-hidden bg-black/10 dark:bg-white/10">
                              <img src={imgUrl} alt={\`preview-\${idx}\`} className="w-full h-20 object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-white text-lg font-bold hover:bg-black/70"
                                disabled={uploading}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}`;

if (oldPattern.test(content)) {
  content = content.replace(oldPattern, newContent);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('File updated successfully');
} else {
  console.log('Pattern not found, trying alternative approach...');
  // Try simpler replacement
  content = content.replace(/<img src=\{img\}/g, '<img src={typeof img === "string" ? img : (img?.url || "")}');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Applied simpler fix');
}
