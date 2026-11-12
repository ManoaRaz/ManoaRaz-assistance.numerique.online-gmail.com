from pathlib import Path
out=Path(__file__).parent
scenes=[
('bord', '#fbd99b','#fb825a','#36b6ae','#117e95'),
('baobab','#fddca9','#fead68','#71bdad','#19858d'),
('cirque','#a5dcf4','#fcdd9f','#e77b46','#a64a43'),
('lac','#bceadf','#e5f9d8','#56baa9','#2a756e'),
('plage','#8fe3e2','#fbe19c','#54bbc2','#1994a1'),
('port','#b2dce7','#ffd39b','#65bcc8','#497f9c')]
for kind,sky1,sky2,sea1,sea2 in scenes:
 extra=''
 if kind in ('bord','baobab'):
  extra='''<path d="M550 682 Q545 548 574 425 Q585 400 600 430 L624 680Z" fill="#805340"/><path d="M565 492 Q475 461 420 391 M590 478 Q676 430 727 362 M580 454 Q541 376 510 321 M591 450 Q624 340 658 298 M573 444 Q470 416 443 331" stroke="#805340" stroke-width="23" fill="none" stroke-linecap="round"/><ellipse cx="495" cy="367" rx="105" ry="39" fill="#669761" opacity=".93"/><ellipse cx="656" cy="359" rx="131" ry="44" fill="#4d8863" opacity=".98"/><ellipse cx="537" cy="321" rx="72" ry="31" fill="#74ab67"/>'''
 if kind=='cirque':
  extra='''<path d="M0 500 L145 286 L265 394 L436 235 L654 415 L825 261 L1046 416 L1277 282 L1600 437 L1600 1000 L0 1000Z" fill="#aa4f3d"/><path d="M0 610 L148 385 L272 492 L447 333 L642 522 L811 358 L1054 523 L1293 374 L1600 536 L1600 1000 L0 1000Z" fill="#dc8052"/><path d="M0 737 Q370 595 620 720 T1600 699 L1600 1000 L0 1000Z" fill="#efb06f"/><path d="M420 342 L630 524 M810 361 L1050 526 M1290 377 L1540 520" stroke="#f6c187" stroke-width="19" opacity=".6"/>'''
 if kind=='lac':
  extra='''<path d="M0 640 Q380 478 708 592 Q1099 442 1600 601 L1600 1000 L0 1000Z" fill="#2f805e"/><path d="M0 754 Q479 599 842 725 Q1205 620 1600 729 L1600 1000 L0 1000Z" fill="#89cca8"/><ellipse cx="870" cy="817" rx="815" ry="158" fill="#64c2be"/><path d="M237 625 Q349 429 479 627 M1187 593 Q1283 374 1426 614" fill="none" stroke="#3f8060" stroke-width="42" stroke-linecap="round"/>'''
 if kind=='plage':
  extra='''<path d="M0 720 Q469 681 698 754 T1600 728 L1600 1000 L0 1000Z" fill="#f8dfad"/><path d="M0 788 Q482 718 857 824 T1600 773" stroke="#fff9e6" fill="none" stroke-width="25" opacity=".8"/><path d="M127 787 Q203 517 279 447" fill="none" stroke="#8e684a" stroke-width="28"/><path d="M280 452 Q183 348 85 382 Q171 336 287 408 Q341 318 431 325 Q340 389 302 445 Q396 424 461 487 Q361 481 280 452Z" fill="#289173"/>'''
 if kind=='port':
  extra='''<path d="M100 668 L397 668 L359 744 L166 744Z" fill="#a45e47"/><path d="M244 479 L250 675 M248 522 L379 666 L248 666Z" fill="#fff4da"/><path d="M831 657 L1196 657 L1158 750 L883 750Z" fill="#745366"/><path d="M991 400 L991 655 M995 441 L1141 648 L995 646Z" fill="#fce9cc"/><path d="M1323 654 L1574 654 L1533 724 L1360 724Z" fill="#8d5c56"/>'''
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><defs><linearGradient id="sky" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="{sky1}"/><stop offset="1" stop-color="{sky2}"/></linearGradient><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="{sea1}"/><stop offset="1" stop-color="{sea2}"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#sky)"/><circle cx="1222" cy="258" r="112" fill="#ffe6aa" opacity=".85"/><path d="M0 562 Q240 536 485 570 T1060 549 T1600 559 L1600 1000 L0 1000Z" fill="url(#sea)"/><path d="M0 788 Q500 742 820 797 T1600 785" stroke="#fff8cc" stroke-width="16" opacity=".35" fill="none"/>{extra}<path d="M0 918 Q392 890 824 925 T1600 910 L1600 1000 L0 1000Z" fill="#1c5b64" opacity=".08"/></svg>'''
 (out/f'{kind}.svg').write_text(svg, encoding='utf-8')
