import struct, zlib, os

def create_png(width, height, rgba):
    def chunk(t, d):
        return struct.pack('>I',len(d))+t+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            i = (y*width+x)*4
            raw += bytes(rgba[i:i+4])
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',ihdr)+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')

def fill(img,w,h,x1,y1,x2,y2,r,g,b,a=255):
    for y in range(max(0,y1),min(h,y2)):
        for x in range(max(0,x1),min(w,x2)):
            i = (y*w+x)*4; img[i:i+4] = [r,g,b,a]

def circle(img,w,h,cx,cy,rr,r,g,b,a=255):
    for y in range(max(0,cy-rr),min(h,cy+rr)):
        for x in range(max(0,cx-rr),min(w,cx+rr)):
            if (x-cx)**2+(y-cy)**2 <= rr**2:
                i = (y*w+x)*4; img[i:i+4] = [r,g,b,a]

def tri(img,w,h,x1,y1,x2,y2,x3,y3,r,g,b,a=255):
    minx=max(0,min(x1,x2,x3)); maxx=min(w,max(x1,x2,x3))
    miny=max(0,min(y1,y2,y3)); maxy=min(h,max(y1,y2,y3))
    for y in range(miny,maxy):
        for x in range(minx,maxx):
            d1=(x2-x3)*(y-y3)-(y2-y3)*(x-x3)
            d2=(x3-x1)*(y-y1)-(y3-y1)*(x-x1)
            d3=(x1-x2)*(y-y2)-(y1-y2)*(x-x2)
            if (d1>=0 and d2>=0 and d3>=0) or (d1<=0 and d2<=0 and d3<=0):
                i = (y*w+x)*4; img[i:i+4] = [r,g,b,a]

def save(name, w, h, rgba, base):
    p = create_png(w, h, rgba)
    path = f'/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/{name}'
    with open(path, 'wb') as f: f.write(p)
    print(f'{name} saved ({w}x{h})')

S=64; R=37; G=99; B=235; R2=13; G2=71; B2=161; R3=120; G3=130; B3=150

# === HOME (屋) ===
img=[0]*(S*S*4)
tri(img,S,S, 32,6, 10,28, 54,28, R,G,B,230)
fill(img,S,S, 16,28, 48,55, R,G,B,200)
fill(img,S,S, 28,38, 36,55, 255,255,255,200)  # window
png=create_png(S,S,img)
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/home.png','wb') as f: f.write(png)

img=[0]*(S*S*4)
tri(img,S,S, 32,6, 10,28, 54,28, R2,G2,B2,230)
fill(img,S,S, 16,28, 48,55, R2,G2,B2,200)
fill(img,S,S, 28,38, 36,55, 255,255,255,200)
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/home_active.png','wb') as f: f.write(create_png(S,S,img))

# === LIST (文档/列表) ===
img=[0]*(S*S*4)
fill(img,S,S, 12,10, 52,54, R,G,B,210)    # clip body
fill(img,S,S, 15,13, 49,51, 255,255,255,240) # white inner
fill(img,S,S, 20,18, 44,20, R,G,B,170)    # title bar
fill(img,S,S, 20,26, 44,27, R,G,B,100)    # line 1
fill(img,S,S, 20,32, 44,33, R,G,B,100)    # line 2
fill(img,S,S, 20,38, 44,39, R,G,B,100)    # line 3
fill(img,S,S, 20,44, 38,45, R,G,B,80)     # line 4
circle(img,S,S, 32,8, 6, R,G,B,200)       # clip circle top
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/list.png','wb') as f: f.write(create_png(S,S,img))

img=[0]*(S*S*4)
fill(img,S,S, 12,10, 52,54, R2,G2,B2,210)
fill(img,S,S, 15,13, 49,51, 255,255,255,240)
fill(img,S,S, 20,18, 44,20, R2,G2,B2,170)
fill(img,S,S, 20,26, 44,27, R2,G2,B2,100)
fill(img,S,S, 20,32, 44,33, R2,G2,B2,100)
fill(img,S,S, 20,38, 44,39, R2,G2,B2,100)
fill(img,S,S, 20,44, 38,45, R2,G2,B2,80)
circle(img,S,S, 32,8, 6, R2,G2,B2,200)
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/list_active.png','wb') as f: f.write(create_png(S,S,img))

# === PROFILE (人) ===
img=[0]*(S*S*4)
circle(img,S,S, 32,22, 12, R,G,B,200)    # head
fill(img,S,S, 8,36, 56,58, R,G,B,200)    # body
circle(img,S,S, 32,20, 9, 255,255,255,220) # face highlight
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/profile.png','wb') as f: f.write(create_png(S,S,img))

img=[0]*(S*S*4)
circle(img,S,S, 32,22, 12, R2,G2,B2,200)
fill(img,S,S, 8,36, 56,58, R2,G2,B2,200)
circle(img,S,S, 32,20, 9, 255,255,255,220)
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/profile_active.png','wb') as f: f.write(create_png(S,S,img))

# === Template images (larger 320x240) ===
TL=320; TH=240
for name, Rc, Gc, Bc, label in [
    ('template-1', 37, 99, 235, 'Classic'),
    ('template-2', 124, 58, 237, 'Modern'),
    ('template-3', 236, 72, 153, 'Premium')
]:
    img=[0]*(TL*TH*4)
    # Gradient background
    for y in range(TH):
        ratio = y/TH
        r = int(Rc*(1-ratio) + (Rc+40)*ratio)
        g = int(Gc*(1-ratio) + (Gc-20)*ratio)
        b = int(Bc*(1-ratio) + (Bc+30)*ratio)
        for x in range(TL):
            i = (y*TL+x)*4; img[i:i+4] = [r,g,b,255]
    # Decorative elements - circles
    circle(img,TL,TH, 80,60, 50, Rc+30,Gc+20,Bc+30,60)
    circle(img,TL,TH, 240,180, 70, Rc-20,Gc-10,Bc+10,40)
    circle(img,TL,TH, 200,60, 35, 255,255,255,30)
    # Text bar
    fill(img,TL,TH, 0,200, TL,240, 0,0,0,80)
    fill(img,TL,TH, 20,212, 120,228, 255,255,255,180)
    fill(img,TL,TH, 20,216, 300,218, 255,255,255,60)
    path = f'/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/{name}.png'
    with open(path, 'wb') as f: f.write(create_png(TL,TH,img))
    print(f'{name}.png saved')

# Default template - grey
img=[0]*(TL*TH*4)
for y in range(TH):
    for x in range(TL):
        i = (y*TL+x)*4; v=200+int(30*y/TH); img[i:i+4]=[v,v,v,255]
fill(img,TL,TH, 0,200, TL,240, 0,0,0,60)
with open('/Users/skyworth/WorkBuddy/2026-05-13-task-6/miniprogram/images/template-default.png','wb') as f: f.write(create_png(TL,TH,img))
print('template-default.png saved')

print('\nAll assets generated!')
