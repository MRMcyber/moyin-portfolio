import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(root,'../Images'),destination=path.join(root,'dist/assets/uploads');
const file=path.join(root,'dist/content.json'),content=JSON.parse(fs.readFileSync(file,'utf8'));
fs.mkdirSync(destination,{recursive:true});
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
let added=0;const unclassified=[];
for(const image of fs.existsSync(source)?walk(source):[]){if(!/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(image))continue;const relative=path.relative(source,image),isCert=/cert|credential|diploma|badge|oscp|ejpt|cpts|pnpt|comptia/i.test(relative),isProject=/project|screenshot|work|lab|tool/i.test(relative);if(!isCert&&!isProject){unclassified.push(relative);continue}const type=isCert?'certifications':'projects';const name=relative.replace(/[\\/]/g,'-').replace(/[^a-zA-Z0-9._-]/g,'-');fs.copyFileSync(image,path.join(destination,name));const url='assets/uploads/'+name;if(!content[type].some(item=>item.image===url)){content[type].push({title:path.basename(image,path.extname(image)).replace(/[-_]/g,' '),image:url,description:''});added++}}
fs.writeFileSync(file,JSON.stringify(content,null,2)+'\n');console.log(JSON.stringify({added,certifications:content.certifications.length,projects:content.projects.length,unclassified}));
