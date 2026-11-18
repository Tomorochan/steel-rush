#!/usr/bin/env python3
"""Procedural model enrichment for STEEL RUSH 1.2, 9 original tanks.
All details are non-colliding and inherit Hull / TurretYaw transforms.
"""
from pathlib import Path
import json, math, shutil, subprocess, sys
import numpy as np
import trimesh
from trimesh.visual import TextureVisuals
from trimesh.visual.material import PBRMaterial

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
TANKS=ROOT/'tankbuild'
manifest=SITE/'assets/tanks/manifest.json'
data=json.loads(manifest.read_text(encoding='utf-8'))
COLORS={
 'USSR':{'metal':(94,105,84),'dark':(43,48,42),'canvas':(142,125,88)},
 'GER':{'metal':(124,115,94),'dark':(54,54,51),'canvas':(141,124,95)},
 'USA':{'metal':(109,116,87),'dark':(48,53,45),'canvas':(130,123,87)}
}
def box(d,at):
 m=trimesh.creation.box(extents=d);m.apply_translation(at);return m
def cylinder(radius,height,at,axis='y'):
 m=trimesh.creation.cylinder(radius=radius,height=height,sections=10)
 if axis=='x':m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
 if axis=='y':m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
 m.apply_translation(at);return m
def rod(a,b,radius=.025):
 a=np.asarray(a,float);b=np.asarray(b,float);v=b-a
 m=trimesh.creation.cylinder(radius=radius,height=np.linalg.norm(v),sections=8)
 m.apply_transform(trimesh.geometry.align_vectors([0,0,1],v))
 m.apply_translation((a+b)*.5)
 return m
def bounds(sc,node):
 m,geom=sc.graph[node];v=trimesh.transform_points(sc.geometry[geom].vertices,m)
 return v.min(0),v.max(0)
def add_details(scene,original,meta):
 if any('SR12_' in x for x in scene.geometry):return 0
 body=bounds(original,'Hull_ArmorShell')
 turret=bounds(original,'Turret_ArmorShell')
 top=float(body[1][1])
 roof_world=float(turret[1][1])
 turret_y=float(original.graph['TurretYaw'][0][1,3])
 roof=roof_world-turret_y
 tz=float((turret[0][2]+turret[1][2])*.5)
 tw=float(turret[1][0]-turret[0][0])
 tl=float(turret[1][2]-turret[0][2])
 L=meta['hull_length_m'];W=meta['width_m']
 pal=COLORS[meta['faction']]
 batches={(parent,key):[] for parent in ('Hull','TurretYaw') for key in pal}
 def add(mesh,parent='Hull',key='metal'):batches[parent,key].append(mesh)
 # Raised grilles on engine deck.
 for i in range(11):
  add(box([W*.44,.02,.029],[0,top+.024,-L*.37+i*.06]),key='dark')
 # Retaining straps and canvas toolboxes, plus spare track blocks.
 for side in (-1,1):
  x=side*W*.29
  for n in range(2):
   zz=-L*(.32-n*.085)
   add(box([W*.18,.17,.28],[x,top+.12,zz]),key='canvas')
   add(box([W*.185,.025,.035],[x,top+.23,zz]),key='dark')
  for n in range(7):
   z=(n-3)*L*.065
   add(box([.085,.18,L*.045],[side*W*.47,top-.17,z]),key='dark')
   add(box([.025,.21,.019],[side*W*.5,top-.17,z]))
  cable=[(side*W*.44,top-.27,-L*.28),(side*W*.48,top-.21,-L*.12),(side*W*.48,top-.21,L*.08),(side*W*.44,top-.27,L*.26)]
  for a,b in zip(cable,cable[1:]):add(rod(a,b,.028),key='dark')
  for p in (cable[0],cable[-1]):add(cylinder(.09,.045,p,'x'))
  for z in [-L*.49,L*.49]:
   add(box([.20,.12,.12],[side*W*.28,.92,z]))
   add(cylinder(.076,.11,[side*W*.28,.94,z],'x'),key='dark')
  for k in range(7):
   # Cast fasteners near the track skirt
   add(cylinder(.036,.035,[side*W*.49,top-.05,(k-3)*L*.07],'x'),key='metal')
 # Weld seam, plate fasteners and slotted front driver apertures.
 add(box([W*.6,.028,.03],[0,top-.14,L*.45]),key='dark')
 for side in (-1,1):add(box([.25,.055,.03],[side*W*.18,top-.24,L*.44]),key='dark')
 for x in (-W*.22,0,W*.22):add(box([.09,.08,.03],[x,top-.12,-L*.44]))
 # Turret hatch hinges, rivet strips, grab handles and radio antenna.
 for side in (-1,1):
  for j in range(6):
   z=tz+(j-2.5)*tl*.14
   add(cylinder(.036,.027,[side*tw*.49,roof*.28,z],'x'),parent='TurretYaw',key='dark')
  for z in (tz-tl*.29,tz+tl*.3):
   add(box([.12,.10,.10],[side*tw*.31,roof-.04,z]),parent='TurretYaw')
 for x,z in ((0,tz-tl*.16),(tw*.19,tz+tl*.16)):
  add(cylinder(.15,.055,[x,roof+.034,z]),parent='TurretYaw')
  add(box([.07,.075,.07],[x+.16,roof+.045,z]),parent='TurretYaw',key='dark')
  add(rod([x-.14,roof+.085,z-.09],[x+.14,roof+.085,z-.09],.024),parent='TurretYaw',key='dark')
 ax=tw*.27;az=tz-tl*.31
 add(cylinder(.08,.12,[ax,roof+.065,az]),parent='TurretYaw',key='dark')
 add(rod([ax,roof+.1,az],[ax+.06,roof+1.00,az-.07],.017),parent='TurretYaw',key='dark')
 # Faction-specific cargo; intentionally no political emblems.
 if meta['faction']=='USA':
  add(box([W*.59,.07,.12],[0,top+.18,-L*.43]))
  for i in (-1,0,1):add(box([W*.17,.16,.24],[i*W*.19,top+.31,-L*.42]),key='canvas')
 elif meta['faction']=='GER':
  for i in range(5):add(box([.34,.09,.11],[(i-2)*.38,top+.07,L*.27]),key='dark')
  add(cylinder(.11,.45,[tw*.29,roof*.29,tz-tl*.30],'z'),parent='TurretYaw',key='canvas')
 else:
  for side in (-1,1):add(cylinder(.115,.40,[side*W*.28,top+.18,-L*.42],'z'),key='canvas')
 faces=0
 for (parent,key),geoms in batches.items():
  if not geoms:continue
  mesh=trimesh.util.concatenate(geoms)
  mesh.visual=TextureVisuals(material=PBRMaterial(
   name='SR12_'+key,baseColorFactor=[*(v/255 for v in pal[key]),1],
   metallicFactor=.30,roughnessFactor=.80,doubleSided=True))
  faces+=len(mesh.faces)
  scene.add_geometry(mesh,geom_name='SR12_'+parent+'_'+key,
                     node_name='SR12_'+parent+'_'+key,parent_node_name=parent)
 return faces

total=0
for spec in data['models']:
 path=SITE/'assets/tanks'/spec['filename']
 original=trimesh.load(TANKS/'assets/tanks'/spec['filename'],force='scene',process=False)
 scene=trimesh.load(path,force='scene',process=False)
 added=add_details(scene,original,spec)
 assert added>=1000,(spec['id'],added)
 path.write_bytes(trimesh.exchange.gltf.export_glb(scene,include_normals=True))
 check=trimesh.load(path,force='scene')
 assert any(x.startswith('SR12_TurretYaw_') for x in check.graph.nodes_geometry)
 assert any(x.startswith('SR12_Hull_') for x in check.graph.nodes_geometry)
 count=sum(len(g.faces) for g in check.geometry.values())
 spec['optimized']['triangles']=count
 spec['optimized']['meshes']=len(check.geometry)
 spec['optimized']['file_bytes']=path.stat().st_size
 spec['triangles']=count
 spec['file_bytes']=path.stat().st_size
 spec['detail_v1_2']={'extra_triangles':added,'components':'grilles, stowage, spare tracks, rivets, tow-cables, antenna, service hatches'}
 shutil.copy2(path,TANKS/'assets/tanks'/spec['filename'])
 total+=added
 print('DETAIL',spec['id'],'+',added,'tris',len(check.geometry),'meshes',flush=True)
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(TANKS/'manifest.json').write_text(manifest.read_text(encoding='utf-8'),encoding='utf-8')
subprocess.run([sys.executable,str(TANKS/'tools/render_preview.py')],check=True)
for image in (TANKS/'previews').glob('*.png'):
 shutil.copy2(image,SITE/'assets/previews'/image.name)
print('PASS: 9 detailed GLB models, additional triangles:',total,flush=True)