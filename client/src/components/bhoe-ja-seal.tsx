import { cn } from '../lib/utils';

/**
 * BhoeJa seal: the stacked Tibet (bod) over tea (ja) mark, baked to vector
 * outlines from Noto Sans Tibetan Bold. No font dependency, no hardcoded
 * color: glyphs use fill="currentColor" so the mark recolors with the theme
 * via the text-* utility on the wrapper (text-primary in the header).
 *
 * Regeneration: if the brand mark ever changes, re-export from the SVG
 * master (client/public/bhoe-ja-seal.svg) and paste the paths here.
 */
export function BhoeJaSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-2120.50 -2449.00 4210.00 4210.00"
      className={cn('h-8 w-8', className)}
      role="img"
      aria-hidden="true"
    >
      <g transform="scale(1,-1)" fill="currentColor">
        <path
          d="M1292 1389 1223 1090V150L1067 180Q944 374 828.5 451.0Q713 528 510 528Q345 528 178 502L66 604Q102 848 171 1090H82L152 1389ZM1063 431Q1034 819 965 1090H396Q321 977 259 819Q365 838 467 838Q672 838 806.0 745.0Q940 652 1063 431Z"
          transform="translate(-1300.50 0.00)"
        />
        <path
          d="M-29 2154Q-76 2032 -137.5 1957.0Q-199 1882 -284.0 1846.5Q-369 1811 -517.5 1794.0Q-666 1777 -759.0 1763.0Q-852 1749 -909 1679L-889 1653L-838 1589L-897 1454Q-1134 1661 -1290.5 1751.0Q-1447 1841 -1583 1841Q-1661 1841 -1737 1817L-1690 2120Q-1627 2148 -1538 2148Q-1408 2148 -1288.0 2066.5Q-1168 1985 -1005 1795Q-951 1945 -864.0 2011.0Q-777 2077 -587.0 2087.5Q-397 2098 -292.0 2129.5Q-187 2161 -127 2269Z"
          transform="translate(448.50 0.00)"
        />
        <path
          d="M1049 -901Q1027 -246 993.0 27.5Q959 301 864.5 416.5Q770 532 547 532Q370 532 199 502L66 649Q101 867 159 1090H82L152 1389H1153L1083 1090H397Q329 972 267 823Q438 844 588 844Q846 844 975.0 710.0Q1104 576 1154.0 213.5Q1204 -149 1204 -995Z"
          transform="translate(53.50 0.00)"
        />
        <path
          d="M1133 16Q967 201 840.0 263.5Q713 326 514 326Q323 326 135 287L43 422Q95 764 185 1090H111L180 1389H1141L1071 1090H392L346 975H1022L961 717H259L223 592Q355 614 492 614Q742 614 911.0 495.5Q1080 377 1288 45Z"
          transform="translate(-628.50 -1597.00)"
        />
      </g>
    </svg>
  );
}
