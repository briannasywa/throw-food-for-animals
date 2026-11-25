# Generator src/voxel/foods.json: 18 makanan voxel original (format sama dengan hewan, lihat voxel-spec.md).
# Satuan voxel; model berpusat di (0,0,0), tinggi ±4 voxel. Game memakai skala 0.5 → ±2 unit dunia.
import json, os
os.chdir(r'C:\Users\V16 NITRO\Documents\Game roblox bikin\prototype')

def B(x, y, z, w, h, d, c):
    return [round(x, 3), round(y, 3), round(z, 3), w, h, d, c]

def carrot(body, body2, leaf, sparkle=None):
    bx = [
        B(0, 1.1, 0, 2.0, 1.2, 2.0, body), B(0, 0.1, 0, 1.6, 0.9, 1.6, body),
        B(0, -0.75, 0, 1.15, 0.9, 1.15, body), B(0, -1.5, 0, 0.7, 0.7, 0.7, body), B(0, -2.0, 0, 0.35, 0.4, 0.35, body),
        B(1.01, 0.6, 0, 0.05, 0.25, 0.9, body2), B(-0.81, -0.3, 0.2, 0.05, 0.25, 0.7, body2), B(0.2, -1.0, 0.59, 0.6, 0.2, 0.05, body2),
        B(0, 2.1, 0, 0.5, 0.9, 0.5, leaf), B(-0.45, 2.3, 0, 0.35, 1.1, 0.35, leaf), B(0.45, 2.25, 0.1, 0.35, 1.0, 0.35, leaf), B(0, 2.4, -0.4, 0.3, 1.0, 0.3, leaf),
    ]
    if sparkle:
        bx += [B(1.3, 1.9, 0.6, 0.35, 0.35, 0.35, sparkle), B(-1.3, -0.6, 0.5, 0.3, 0.3, 0.3, sparkle), B(0.9, -1.6, -0.6, 0.25, 0.25, 0.25, sparkle)]
    return bx

def apple(skin, skin2, stem, leaf, drip=None):
    bx = [
        B(0, 0, 0, 3.0, 2.6, 3.0, skin), B(0, 0, 0, 2.4, 3.2, 2.4, skin), B(0, 0, 0, 3.4, 1.8, 2.4, skin), B(0, 0, 0, 2.4, 1.8, 3.4, skin),
        B(0.9, 0.6, 1.71, 0.6, 0.6, 0.05, skin2), B(0, 1.7, 0, 0.3, 0.8, 0.3, stem), B(0.55, 1.9, 0, 0.8, 0.3, 0.5, leaf),
    ]
    if drip:
        bx += [B(0, 1.55, 0, 2.6, 0.25, 2.6, drip), B(1.2, 0.9, 0.9, 0.35, 1.0, 0.35, drip), B(-1.25, 0.6, -0.5, 0.35, 1.5, 0.35, drip),
               B(-0.3, 0.8, 1.25, 0.35, 1.2, 0.35, drip), B(0.6, 0.4, -1.25, 0.35, 1.9, 0.35, drip)]
    return bx

def drumstick(meat, meat2, bone):
    return [
        B(-0.9, 0.3, 0, 2.6, 2.4, 2.4, meat), B(-0.9, 0.3, 0, 2.0, 2.9, 2.0, meat), B(-0.9, 0.3, 0, 3.0, 1.8, 1.9, meat),
        B(-0.6, 1.2, 0.9, 1.2, 0.4, 0.6, meat2), B(0.6, -0.1, 0, 0.6, 1.4, 1.4, meat),
        B(1.6, -0.4, 0, 1.8, 0.7, 0.7, bone), B(2.65, -0.05, 0, 0.7, 0.8, 1.1, bone), B(2.65, -0.85, 0, 0.7, 0.8, 1.1, bone),
    ]

def steak(meat, fat, bone, grill):
    return [
        B(0, 0, 0, 3.8, 0.9, 2.8, meat), B(-0.3, 0, 0, 3.2, 0.9, 3.4, meat), B(1.6, 0, -0.9, 0.9, 0.95, 1.2, fat),
        B(-1.9, 0.0, 0, 0.3, 0.92, 2.6, fat), B(0.2, 0, 0, 0.35, 1.0, 2.9, bone), B(0.2, 0, -1.2, 1.4, 1.0, 0.35, bone),
        B(-1.0, 0.47, 0.6, 1.8, 0.05, 0.25, grill), B(-0.8, 0.47, -0.3, 1.8, 0.05, 0.25, grill), B(0.9, 0.47, 0.8, 1.0, 0.05, 0.25, grill),
    ]

def burger(layers):
    # layers: lijst (tebal, lebar, warna) dari bawah ke atas, lalu atap bun
    bx = []
    y = -1.8
    for h, w, c in layers:
        bx.append(B(0, y + h / 2, 0, w, h, w, c))
        y += h
    return bx

def burger_basic(bun, lettuce, patty, cheese, seed):
    bx = burger([(0.7, 3.2, bun), (0.25, 3.5, lettuce), (0.8, 3.3, patty), (0.2, 3.5, cheese)])
    bx += [B(0, 0.35, 0, 3.2, 0.9, 3.2, bun), B(0, 0.95, 0, 2.4, 0.5, 2.4, bun),
           B(-0.7, 1.21, 0.4, 0.25, 0.05, 0.4, seed), B(0.6, 1.21, -0.3, 0.25, 0.05, 0.4, seed), B(0.1, 1.21, 0.9, 0.25, 0.05, 0.4, seed)]
    return bx

def burger_mega(bun, lettuce, patty, cheese, seed, glow):
    bx = burger([(0.6, 3.2, bun), (0.2, 3.5, lettuce), (0.6, 3.3, patty), (0.15, 3.5, cheese), (0.6, 3.3, patty), (0.15, 3.5, cheese),
                 (0.6, 3.3, patty), (0.2, 3.5, glow)])
    top = -1.8 + 0.6 + 0.2 + 0.6 + 0.15 + 0.6 + 0.15 + 0.6 + 0.2
    bx += [B(0, top + 0.4, 0, 3.2, 0.8, 3.2, bun), B(0, top + 0.95, 0, 2.4, 0.4, 2.4, bun),
           B(-0.7, top + 1.16, 0.4, 0.25, 0.05, 0.4, seed), B(0.6, top + 1.16, -0.3, 0.25, 0.05, 0.4, seed),
           B(1.3, top - 0.3, 1.3, 0.4, 0.7, 0.4, glow), B(-1.4, top - 1.4, -1.0, 0.35, 0.9, 0.35, glow)]
    # turunkan supaya tetap berpusat
    shift = (top + 1.15 - 1.8) / 2
    return [[b[0], round(b[1] - shift, 3), *b[2:]] for b in bx]

def roll(nori, rice, filling, flame, hot=False):
    bx = [
        B(0, 0, 0, 3.4, 2.4, 3.4, nori), B(0, 0, 0, 2.8, 2.5, 2.8, rice), B(0, 0, 0, 1.4, 2.55, 1.4, filling),
        B(0, 1.45, 0, 1.0, 0.5, 1.0, flame), B(0.3, 1.9, 0.1, 0.5, 0.5, 0.5, flame),
    ]
    if hot:
        bx += [B(-0.4, 2.1, -0.2, 0.4, 0.8, 0.4, flame), B(1.2, 1.5, 1.2, 0.5, 0.7, 0.5, flame), B(-1.3, 1.4, 1.0, 0.4, 0.6, 0.4, flame),
               B(0, 0, 1.75, 1.0, 1.0, 0.1, filling), B(1.75, -0.4, 0, 0.1, 0.8, 0.8, filling)]
    return bx

def shell(shell1, shell2, pearl, pearl2):
    return [
        B(0, -1.2, 0, 3.8, 0.6, 3.2, shell1), B(0, -0.8, 0.2, 3.2, 0.3, 2.6, shell2),
        B(-1.2, -0.85, 0, 0.2, 0.35, 2.8, shell1), B(0, -0.85, 0, 0.2, 0.35, 2.8, shell1), B(1.2, -0.85, 0, 0.2, 0.35, 2.8, shell1),
        B(0, 1.2, -1.5, 3.8, 2.4, 0.5, shell1), B(0, 1.2, -1.2, 3.2, 2.0, 0.2, shell2),
        B(0, 0.1, 0.3, 1.8, 1.8, 1.8, pearl), B(0, 0.1, 0.3, 1.4, 2.2, 1.4, pearl), B(0, 0.1, 0.3, 2.2, 1.4, 1.4, pearl),
        B(-0.45, 0.6, 1.15, 0.4, 0.4, 0.1, pearl2),
    ]

def candy(stripeA, stripeB, wrap):
    return [
        B(0, 0, 0, 2.4, 2.0, 2.0, stripeA), B(-0.6, 0, 0, 0.4, 2.05, 2.05, stripeB), B(0.6, 0, 0, 0.4, 2.05, 2.05, stripeB),
        B(-1.5, 0, 0, 0.6, 0.8, 0.8, wrap), B(-2.1, 0, 0, 0.6, 1.8, 1.4, wrap), B(1.5, 0, 0, 0.6, 0.8, 0.8, wrap), B(2.1, 0, 0, 0.6, 1.8, 1.4, wrap),
    ]

def gem(c1, c2, c3):
    return [
        B(0, 0.2, 0, 2.6, 1.2, 2.6, c1), B(0, 1.1, 0, 1.8, 0.6, 1.8, c2), B(0, -0.8, 0, 1.8, 0.8, 1.8, c1),
        B(0, -1.5, 0, 1.0, 0.6, 1.0, c3), B(0, -2.0, 0, 0.4, 0.4, 0.4, c3), B(0.6, 0.6, 1.31, 0.4, 0.4, 0.05, c2),
    ]

def crystal_cluster(c1, c2, c3):
    return [
        B(0, -1.7, 0, 3.4, 0.6, 2.6, c3),
        B(0, 0.1, 0, 1.2, 3.4, 1.2, c1), B(0, 2.0, 0, 0.7, 0.6, 0.7, c2),
        B(-1.1, -0.6, 0.3, 0.9, 2.0, 0.9, c1), B(-1.1, 0.6, 0.3, 0.5, 0.5, 0.5, c2),
        B(1.0, -0.8, -0.3, 0.9, 1.6, 0.9, c2), B(1.0, 0.2, -0.3, 0.5, 0.5, 0.5, c1),
        B(0.4, -1.0, 0.9, 0.6, 1.0, 0.6, c1),
    ]

def cake_slice(sponge, cream, top, star):
    return [
        B(0, -0.9, 0, 3.4, 1.0, 3.0, sponge), B(0, -0.25, 0, 3.4, 0.3, 3.0, cream), B(0, 0.4, 0, 3.4, 1.0, 3.0, sponge),
        B(0, 1.05, 0, 3.5, 0.3, 3.1, top), B(0, 1.55, 0, 0.5, 0.7, 0.5, star), B(0, 1.55, 0, 1.3, 0.3, 0.3, star), B(0, 1.55, 0, 0.3, 0.3, 1.3, star),
    ]

def cake_tier(sponge, cream, top, star, star2):
    return [
        B(0, -1.3, 0, 3.8, 1.2, 3.8, sponge), B(0, -0.6, 0, 3.9, 0.3, 3.9, cream),
        B(0, 0.1, 0, 2.6, 1.1, 2.6, top), B(0, 0.75, 0, 2.7, 0.25, 2.7, cream),
        B(0, 1.35, 0, 0.5, 0.9, 0.5, star), B(0, 1.35, 0, 1.5, 0.35, 0.35, star), B(0, 1.35, 0, 0.35, 0.35, 1.5, star),
        B(1.7, -1.0, 1.95, 0.35, 0.35, 0.05, star2), B(-1.2, -1.5, 1.95, 0.3, 0.3, 0.05, star2), B(0.6, 0.1, 1.31, 0.3, 0.3, 0.05, star2),
        B(-1.95, -1.1, -0.5, 0.05, 0.35, 0.35, star2),
    ]

def ginger_star(cookie, icing, button):
    bx = [B(0, 0, 0, 1.6, 0.6, 1.6, cookie), B(0, 0, 1.4, 0.8, 0.6, 1.4, cookie), B(0, 0, -1.4, 0.8, 0.6, 1.4, cookie),
          B(1.4, 0, 0, 1.4, 0.6, 0.8, cookie), B(-1.4, 0, 0, 1.4, 0.6, 0.8, cookie),
          B(0, 0.33, 1.6, 0.3, 0.05, 0.8, icing), B(0, 0.33, -1.6, 0.3, 0.05, 0.8, icing), B(1.6, 0.33, 0, 0.8, 0.05, 0.3, icing), B(-1.6, 0.33, 0, 0.8, 0.05, 0.3, icing),
          B(0, 0.36, 0, 0.5, 0.1, 0.5, button)]
    # berdiri tegak menghadap depan (+z) supaya bentuk bintangnya terbaca: tukar sumbu y <-> z
    return [[b[0], b[2], b[1], b[3], b[5], b[4], b[6]] for b in bx]

FOODS = [
    dict(id='carrot', name='Carrot', colors={'body': '#FF8A2A', 'body2': '#E06A14', 'leaf': '#3FBF4F'}, boxes=carrot('body', 'body2', 'leaf')),
    dict(id='apple', name='Apple', colors={'skin': '#9BE36A', 'skin2': '#D8F7B8', 'stem': '#7A4A2A', 'leaf': '#2FA84F'}, boxes=apple('skin', 'skin2', 'stem', 'leaf')),
    dict(id='meat', name='Meat', colors={'meat': '#B5543A', 'meat2': '#D9774F', 'bone': '#FFF4DC'}, boxes=drumstick('meat', 'meat2', 'bone')),
    dict(id='burger', name='Burger', colors={'bun': '#E9A84C', 'lettuce': '#8CFF3A', 'patty': '#6B3A22', 'cheese': '#FFD54A', 'seed': '#FFF4DC'}, boxes=burger_basic('bun', 'lettuce', 'patty', 'cheese', 'seed')),
    dict(id='sushi', name='Lava Roll', colors={'nori': '#1B2233', 'rice': '#FFF8EE', 'filling': '#FF5A1F', 'flame': '#FFB020'}, glow={'flame': 0.6}, boxes=roll('nori', 'rice', 'filling', 'flame')),
    dict(id='pearl', name='Pearl', colors={'shell1': '#FF9EC8', 'shell2': '#FFD3E6', 'pearl': '#BFFBFF', 'pearl2': '#FFFFFF'}, glow={'pearl': 0.5}, boxes=shell('shell1', 'shell2', 'pearl', 'pearl2')),
    dict(id='candy_cane', name='Candy', colors={'a': '#E8384F', 'b': '#FFFFFF', 'wrap': '#FFB3C7'}, boxes=candy('a', 'b', 'wrap')),
    dict(id='ice_crystal', name='Ice Gem', colors={'c1': '#7FD3FF', 'c2': '#D9F4FF', 'c3': '#4AA8E8'}, glow={'c2': 0.4}, boxes=gem('c1', 'c2', 'c3')),
    dict(id='star_cake', name='Galaxy', colors={'sponge': '#7A4FD9', 'cream': '#FFF4DC', 'top': '#B57BFF', 'star': '#FFE680'}, glow={'star': 0.7}, boxes=cake_slice('sponge', 'cream', 'top', 'star')),
    dict(id='golden_carrot', name='Golden Carrot', colors={'body': '#FFC21A', 'body2': '#E39B00', 'leaf': '#3FBF4F', 'spark': '#FFFBE0'}, glow={'body': 0.25, 'spark': 0.9}, boxes=carrot('body', 'body2', 'leaf', 'spark')),
    dict(id='honey_apple', name='Honey Apple', colors={'skin': '#E8384F', 'skin2': '#FF8FA0', 'stem': '#7A4A2A', 'leaf': '#2FA84F', 'honey': '#FFB020'}, glow={'honey': 0.3}, boxes=apple('skin', 'skin2', 'stem', 'leaf', 'honey')),
    dict(id='prime_steak', name='Prime Steak', colors={'meat': '#C8323C', 'fat': '#FFE3D6', 'bone': '#FFF4DC', 'grill': '#5A1F1F'}, boxes=steak('meat', 'fat', 'bone', 'grill')),
    dict(id='mega_burger', name='Mega Burger', colors={'bun': '#E9A84C', 'lettuce': '#8CFF3A', 'patty': '#6B3A22', 'cheese': '#FFD54A', 'seed': '#FFF4DC', 'ooze': '#B6FF3A'}, glow={'ooze': 0.6}, boxes=burger_mega('bun', 'lettuce', 'patty', 'cheese', 'seed', 'ooze')),
    dict(id='magma_roll', name='Magma Roll', colors={'nori': '#2A1A1A', 'rice': '#3A2A2A', 'filling': '#FF2E1F', 'flame': '#FF8A1F'}, glow={'filling': 0.8, 'flame': 0.8}, boxes=roll('nori', 'rice', 'filling', 'flame', hot=True)),
    dict(id='black_pearl', name='Black Pearl', colors={'shell1': '#3A2D6B', 'shell2': '#6B4FB5', 'pearl': '#1B1530', 'pearl2': '#B57BFF'}, glow={'pearl2': 0.9, 'shell2': 0.2}, boxes=shell('shell1', 'shell2', 'pearl', 'pearl2')),
    dict(id='gingerbread_star', name='Gingerbread Star', colors={'cookie': '#C9822E', 'icing': '#FFFFFF', 'button': '#E8384F'}, boxes=ginger_star('cookie', 'icing', 'button')),
    dict(id='frost_crystal', name='Frost Crystal', colors={'c1': '#B8F0FF', 'c2': '#FFFFFF', 'c3': '#7FA8C9'}, glow={'c1': 0.45, 'c2': 0.6}, boxes=crystal_cluster('c1', 'c2', 'c3')),
    dict(id='nebula_cake', name='Nebula Cake', colors={'sponge': '#5B3FB5', 'cream': '#FFD3F2', 'top': '#FF7BD8', 'star': '#FFE680', 'star2': '#9BEBFF'}, glow={'star': 0.8, 'star2': 0.8, 'top': 0.15}, boxes=cake_tier('sponge', 'cream', 'top', 'star', 'star2')),
]

out = {'zone': 'food', 'theme': 'Makanan khusus zona (Basic & Enhanced). Original, dibuat dari kotak voxel; warna dari palet zona.', 'animals': []}
for f in FOODS:
    out['animals'].append({'id': f'food_{f["id"]}', 'name': f['name'], 'frame': 'prop', 'colors': f['colors'], **({'glow': f['glow']} if 'glow' in f else {}),
                           'parts': [{'name': 'body', 'pivot': [0, 0, 0], 'anim': None, 'boxes': f['boxes']}]})
json.dump(out, open('src/voxel/foods.json', 'w', encoding='utf-8'), indent=1)
print(len(out['animals']), 'foods')
