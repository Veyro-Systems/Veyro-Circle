import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const {fitCommunityView}=createTsLoader()('@/lib/community-map-fit');
function screen(point,view,size){const project=p=>({x:(p.lon+180)/360*256*2**view.zoom,y:(1-Math.log(Math.tan(p.lat*Math.PI/180)+1/Math.cos(p.lat*Math.PI/180))/Math.PI)/2*256*2**view.zoom});const p=project(point),c=project(view);return {x:p.x-c.x+size.width/2,y:p.y-c.y+size.height/2};}
for(const size of [{width:1100,height:650},{width:300,height:460}])test(`all registered areas fit inside ${size.width}px map`,()=>{
 for(const points of [[{lat:55.52,lon:11.86}],[{lat:57.72,lon:10.58},{lat:54.66,lon:11.96},{lat:55.1,lon:14.9},{lat:55.47,lon:8.45}],[{lat:55.5,lon:12},{lat:70.66,lon:23.68}]]){const view=fitCommunityView(points,size);for(const point of points){const p=screen(point,view,size);assert.ok(p.x>=50&&p.x<=size.width-50,JSON.stringify(p));assert.ok(p.y>=65&&p.y<=size.height-65,JSON.stringify(p));}}
});
test('empty and invalid data use a finite Denmark overview',()=>{assert.deepEqual(fitCommunityView([],{width:800,height:600}),fitCommunityView([{lat:NaN,lon:12}],{width:800,height:600}));const view=fitCommunityView([],{width:800,height:600});assert.ok(view.lat>54&&view.lat<58);assert.ok(view.lon>8&&view.lon<16);});
