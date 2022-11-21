# Steps to reproduce the sourcemaps bug

0. pull this repo
1. pnpm i
2. pnpm relay
3. pnpm dev
4. run debugger
5. set breakpoints \src\views\Home\Home.tsx:42, \src\views\Home\Home2.tsx:39
6. debug (see no bugs)
7. change component in src\views\Home\index.ts
8. debug (see the sourcemaps bug)
