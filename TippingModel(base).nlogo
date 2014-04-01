;;;
;;;  =================================================================
;;;
;;;      Defini��o do mundo da simula��o
;;;
;;;  =================================================================
;;;


breed [ populacao1 individuo1 ]
breed [ populacao2 individuo2 ]


to reset
  ca ; clear all
  cria-populacoes
  desenha-chao
end


to cria-populacoes
  let x 0
  let y 0
  let posicoes 0
  let pos 0
    
  set-default-shape turtles "circle"
  create-populacao1 INDIVIDUOS_POPULACAO_1
  ifelse INDIVIDUOS_POPULACAO_1 + INDIVIDUOS_POPULACAO_2 > 81
    [ create-populacao2 81 - INDIVIDUOS_POPULACAO_1 ]
    [ create-populacao2 INDIVIDUOS_POPULACAO_2 ]
  
  ask populacao1 [ set color BLUE ]
  ask populacao2 [ set color ORANGE ]
  
  ; posiciona agentes  
  set x -4
  set y -4
  set posicoes []
  ; cria uma lista com todas as posicoes possiveis
  repeat 9 [  
    repeat 9 [
      set posicoes fput list x y posicoes
      set x (x + 1)
    ]
    set y (y + 1)
    set x -4
  ] 
  
  foreach [who] of turtles [
    ; altera a posi��o de um individuo
    set pos one-of posicoes
    set posicoes remove pos posicoes
    set [xcor] of turtle ? first pos
    set [ycor] of turtle ? last pos
    set [heading] of turtle ? 0
  ]
end


to desenha-chao
  ask patches [ if pxcor > -5 and pxcor < 5 and pycor > -5 and pycor < 5
                  [ set pcolor gray + 3 ] ]
end


;;;
;;;  Pinta o espa�o de acordo com a dispers�o das popula��es. Cada c�lula � pintada
;;;  da cor que identifica a popula��o que domina a c�lula, ou seja a popula��o com 
;;;  mais representantes na vizinhan�a.
;;;
to mostra-dispersao
  let p1 0
  let p2 0
  let vizinhos 0
  let pop1 0
  let pop2 0
  let neutro 0
  
  ask patches with [pcolor != black ] [
    set p1 sum [count populacao1-here] of neighbors
    set p1 (p1 + count populacao1-here)
    
    set p2 sum [count populacao2-here] of neighbors
    set p2 (p2 + count populacao2-here)
    
    ifelse p1 = p2
      [ set pcolor white 
        set neutro neutro + 1 ]
      [ ifelse p1 > p2 
        [ set pcolor blue + 3 
          set pop1 pop1 + 1]
        [ set pcolor orange + 3 
          set pop2 pop2 + 1] ] ]
        
  show word "Dominio da popula��o 1: " pop1
  show word "Dominio da popula��o 2: " pop2
  show word "Dominio neutro: " neutro
end


;;;
;;;  Fun��o que avan�a o estado da simula��o
;;;
to go
  let todos-contentes? true
  
  tick

  ask turtles [
    without-interruption [
      if not contente?
      [ mover-agente ]
      if not contente?
      [ set todos-contentes? false ]
    ]
  ]
  ; verifica se todos os individuos da popula��o est�o contentes
  if todos-contentes?
    ; para a simula��o se todos os agentes est�o contentes
    [ stop ]
  
end


;;;
;;;  =======================================  
;;;    Comportamento dos agentes
;;;  =======================================
;;;
;;;  Definir neste espa�o as fun��es de comportamento dos agentes.
;;;  Para o efeito podem-se usar as variaveis globais definidas como parametros da
;;;  simula��o:
;;;
;;;  INDIVIDUOS_POPULACAO_1:  n�mero de individuos da popula��o 1
;;;  TOLERANCIA_1:  toler�ncia da popula��o 1 (em percentagem)
;;;  INDIVIDUOS_POPULACAO_2:  n�mero de individuos da popula��o 2
;;;  TOLERANCIA_2:  toler�ncia da popula��o 2 (em percentagem)
;;;
;;;  Neste ficheiro est�o definidos dois "breeds" (populacao1, populacao2)
;;;  que representam as duas popula��es. A populacao1 representa os individuos azuis
;;;  e a populacao2 representa os individuos laranja.
;;;  Devem ser usadas as fun��es populacao1-here e populacao2-here para verificar 
;;;  se determinada c�lula cont�m individuos de uma popula��o.
;;;
;;;  Cada individuo guarda informa��o sobre o "breed" a que pertence na vari�vel breed.
;;;

;;;
;;;  Determina se o agente est� contente na posi��o actual
;;;
to-report contente?
  let p1 count neighbors with [any? populacao1-here and pcolor != black]
  let p2 count neighbors with [any? populacao2-here ]
  
 
  ifelse p1 = 0 and p2 = 0
    [report false]
    [ifelse breed = populacao1
      [report (p2 / (p2 + p1)) >= (TOLERANCIA_1 / 100)]
      [report (p1 / (p1 + p2)) >= (TOLERANCIA_2 / 100)]]
end

;;;
;;;  Verifica se o agente se deve mover e executa o movimento se for necess�rio.
;;;
to mover-agente
    let pos one-of neighbors with [not any? turtles-here and pcolor != black]
    if pos != nobody
      [set xcor [pxcor] of pos
       set ycor [pycor] of pos] 
end
@#$#@#$#@
GRAPHICS-WINDOW
331
26
616
332
5
5
25.0
1
10
1
1
1
0
1
1
1
-5
5
-5
5
0
0
1
ticks

CC-WINDOW
5
346
625
441
Command Center
0

BUTTON
29
26
94
59
NIL
Reset
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL

BUTTON
130
26
199
59
Run
go
T
1
T
OBSERVER
NIL
NIL
NIL
NIL

BUTTON
232
26
300
59
Step
go
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL

SLIDER
20
147
226
180
INDIVIDUOS_POPULACAO_1
INDIVIDUOS_POPULACAO_1
1
50
17
1
1
NIL
HORIZONTAL

SLIDER
20
237
226
270
INDIVIDUOS_POPULACAO_2
INDIVIDUOS_POPULACAO_2
1
50
18
1
1
NIL
HORIZONTAL

SLIDER
20
186
215
219
TOLERANCIA_1
TOLERANCIA_1
10
100
30
10
1
por cento
HORIZONTAL

SLIDER
21
276
216
309
TOLERANCIA_2
TOLERANCIA_2
10
100
30
10
1
por cento
HORIZONTAL

BUTTON
29
78
158
111
Mostra Dispers�o
mostra-dispersao
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL

@#$#@#$#@
Schelling Tipping Model

Corpo Docente de AASMA
Adaptado de Rui Prada
@#$#@#$#@
default
true
0
Polygon -7500403 true true 150 5 40 250 150 205 260 250

ant
true
0
Polygon -7500403 true true 136 61 129 46 144 30 119 45 124 60 114 82 97 37 132 10 93 36 111 84 127 105 172 105 189 84 208 35 171 11 202 35 204 37 186 82 177 60 180 44 159 32 170 44 165 60
Polygon -7500403 true true 150 95 135 103 139 117 125 149 137 180 135 196 150 204 166 195 161 180 174 150 158 116 164 102
Polygon -7500403 true true 149 186 128 197 114 232 134 270 149 282 166 270 185 232 171 195 149 186
Polygon -7500403 true true 225 66 230 107 159 122 161 127 234 111 236 106
Polygon -7500403 true true 78 58 99 116 139 123 137 128 95 119
Polygon -7500403 true true 48 103 90 147 129 147 130 151 86 151
Polygon -7500403 true true 65 224 92 171 134 160 135 164 95 175
Polygon -7500403 true true 235 222 210 170 163 162 161 166 208 174
Polygon -7500403 true true 249 107 211 147 168 147 168 150 213 150

arrow
true
0
Polygon -7500403 true true 150 0 0 150 105 150 105 293 195 293 195 150 300 150

bee
true
0
Polygon -1184463 true false 152 149 77 163 67 195 67 211 74 234 85 252 100 264 116 276 134 286 151 300 167 285 182 278 206 260 220 242 226 218 226 195 222 166
Polygon -16777216 true false 150 149 128 151 114 151 98 145 80 122 80 103 81 83 95 67 117 58 141 54 151 53 177 55 195 66 207 82 211 94 211 116 204 139 189 149 171 152
Polygon -7500403 true true 151 54 119 59 96 60 81 50 78 39 87 25 103 18 115 23 121 13 150 1 180 14 189 23 197 17 210 19 222 30 222 44 212 57 192 58
Polygon -16777216 true false 70 185 74 171 223 172 224 186
Polygon -16777216 true false 67 211 71 226 224 226 225 211 67 211
Polygon -16777216 true false 91 257 106 269 195 269 211 255
Line -1 false 144 100 70 87
Line -1 false 70 87 45 87
Line -1 false 45 86 26 97
Line -1 false 26 96 22 115
Line -1 false 22 115 25 130
Line -1 false 26 131 37 141
Line -1 false 37 141 55 144
Line -1 false 55 143 143 101
Line -1 false 141 100 227 138
Line -1 false 227 138 241 137
Line -1 false 241 137 249 129
Line -1 false 249 129 254 110
Line -1 false 253 108 248 97
Line -1 false 249 95 235 82
Line -1 false 235 82 144 100

bird1
false
0
Polygon -7500403 true true 2 6 2 39 270 298 297 298 299 271 187 160 279 75 276 22 100 67 31 0

bird2
false
0
Polygon -7500403 true true 2 4 33 4 298 270 298 298 272 298 155 184 117 289 61 295 61 105 0 43

boat1
false
0
Polygon -1 true false 63 162 90 207 223 207 290 162
Rectangle -6459832 true false 150 32 157 162
Polygon -13345367 true false 150 34 131 49 145 47 147 48 149 49
Polygon -7500403 true true 158 33 230 157 182 150 169 151 157 156
Polygon -7500403 true true 149 55 88 143 103 139 111 136 117 139 126 145 130 147 139 147 146 146 149 55

boat2
false
0
Polygon -1 true false 63 162 90 207 223 207 290 162
Rectangle -6459832 true false 150 32 157 162
Polygon -13345367 true false 150 34 131 49 145 47 147 48 149 49
Polygon -7500403 true true 157 54 175 79 174 96 185 102 178 112 194 124 196 131 190 139 192 146 211 151 216 154 157 154
Polygon -7500403 true true 150 74 146 91 139 99 143 114 141 123 137 126 131 129 132 139 142 136 126 142 119 147 148 147

boat3
false
0
Polygon -1 true false 63 162 90 207 223 207 290 162
Rectangle -6459832 true false 150 32 157 162
Polygon -13345367 true false 150 34 131 49 145 47 147 48 149 49
Polygon -7500403 true true 158 37 172 45 188 59 202 79 217 109 220 130 218 147 204 156 158 156 161 142 170 123 170 102 169 88 165 62
Polygon -7500403 true true 149 66 142 78 139 96 141 111 146 139 148 147 110 147 113 131 118 106 126 71

box
true
0
Polygon -7500403 true true 45 255 255 255 255 45 45 45

butterfly1
true
0
Polygon -16777216 true false 151 76 138 91 138 284 150 296 162 286 162 91
Polygon -7500403 true true 164 106 184 79 205 61 236 48 259 53 279 86 287 119 289 158 278 177 256 182 164 181
Polygon -7500403 true true 136 110 119 82 110 71 85 61 59 48 36 56 17 88 6 115 2 147 15 178 134 178
Polygon -7500403 true true 46 181 28 227 50 255 77 273 112 283 135 274 135 180
Polygon -7500403 true true 165 185 254 184 272 224 255 251 236 267 191 283 164 276
Line -7500403 true 167 47 159 82
Line -7500403 true 136 47 145 81
Circle -7500403 true true 165 45 8
Circle -7500403 true true 134 45 6
Circle -7500403 true true 133 44 7
Circle -7500403 true true 133 43 8

circle
false
0
Circle -7500403 true true 35 35 230

link
true
0
Line -7500403 true 150 0 150 300

link direction
true
0
Line -7500403 true 150 150 30 225
Line -7500403 true 150 150 270 225

person
false
0
Circle -7500403 true true 155 20 63
Rectangle -7500403 true true 158 79 217 164
Polygon -7500403 true true 158 81 110 129 131 143 158 109 165 110
Polygon -7500403 true true 216 83 267 123 248 143 215 107
Polygon -7500403 true true 167 163 145 234 183 234 183 163
Polygon -7500403 true true 195 163 195 233 227 233 206 159

sheep
false
15
Rectangle -1 true true 90 75 270 225
Circle -1 true true 15 75 150
Rectangle -16777216 true false 81 225 134 286
Rectangle -16777216 true false 180 225 238 285
Circle -16777216 true false 1 88 92

spacecraft
true
0
Polygon -7500403 true true 150 0 180 135 255 255 225 240 150 180 75 240 45 255 120 135

thin-arrow
true
0
Polygon -7500403 true true 150 0 0 150 120 150 120 293 180 293 180 150 300 150

truck-down
false
0
Polygon -7500403 true true 225 30 225 270 120 270 105 210 60 180 45 30 105 60 105 30
Polygon -8630108 true false 195 75 195 120 240 120 240 75
Polygon -8630108 true false 195 225 195 180 240 180 240 225

truck-left
false
0
Polygon -7500403 true true 120 135 225 135 225 210 75 210 75 165 105 165
Polygon -8630108 true false 90 210 105 225 120 210
Polygon -8630108 true false 180 210 195 225 210 210

truck-right
false
0
Polygon -7500403 true true 180 135 75 135 75 210 225 210 225 165 195 165
Polygon -8630108 true false 210 210 195 225 180 210
Polygon -8630108 true false 120 210 105 225 90 210

turtle
true
0
Polygon -7500403 true true 138 75 162 75 165 105 225 105 225 142 195 135 195 187 225 195 225 225 195 217 195 202 105 202 105 217 75 225 75 195 105 187 105 135 75 142 75 105 135 105

wolf
false
0
Rectangle -7500403 true true 15 105 105 165
Rectangle -7500403 true true 45 90 105 105
Polygon -7500403 true true 60 90 83 44 104 90
Polygon -16777216 true false 67 90 82 59 97 89
Rectangle -1 true false 48 93 59 105
Rectangle -16777216 true false 51 96 55 101
Rectangle -16777216 true false 0 121 15 135
Rectangle -16777216 true false 15 136 60 151
Polygon -1 true false 15 136 23 149 31 136
Polygon -1 true false 30 151 37 136 43 151
Rectangle -7500403 true true 105 120 263 195
Rectangle -7500403 true true 108 195 259 201
Rectangle -7500403 true true 114 201 252 210
Rectangle -7500403 true true 120 210 243 214
Rectangle -7500403 true true 115 114 255 120
Rectangle -7500403 true true 128 108 248 114
Rectangle -7500403 true true 150 105 225 108
Rectangle -7500403 true true 132 214 155 270
Rectangle -7500403 true true 110 260 132 270
Rectangle -7500403 true true 210 214 232 270
Rectangle -7500403 true true 189 260 210 270
Line -7500403 true 263 127 281 155
Line -7500403 true 281 155 281 192

wolf-left
false
3
Polygon -6459832 true true 117 97 91 74 66 74 60 85 36 85 38 92 44 97 62 97 81 117 84 134 92 147 109 152 136 144 174 144 174 103 143 103 134 97
Polygon -6459832 true true 87 80 79 55 76 79
Polygon -6459832 true true 81 75 70 58 73 82
Polygon -6459832 true true 99 131 76 152 76 163 96 182 104 182 109 173 102 167 99 173 87 159 104 140
Polygon -6459832 true true 107 138 107 186 98 190 99 196 112 196 115 190
Polygon -6459832 true true 116 140 114 189 105 137
Rectangle -6459832 true true 109 150 114 192
Rectangle -6459832 true true 111 143 116 191
Polygon -6459832 true true 168 106 184 98 205 98 218 115 218 137 186 164 196 176 195 194 178 195 178 183 188 183 169 164 173 144
Polygon -6459832 true true 207 140 200 163 206 175 207 192 193 189 192 177 198 176 185 150
Polygon -6459832 true true 214 134 203 168 192 148
Polygon -6459832 true true 204 151 203 176 193 148
Polygon -6459832 true true 207 103 221 98 236 101 243 115 243 128 256 142 239 143 233 133 225 115 214 114

wolf-right
false
3
Polygon -6459832 true true 170 127 200 93 231 93 237 103 262 103 261 113 253 119 231 119 215 143 213 160 208 173 189 187 169 190 154 190 126 180 106 171 72 171 73 126 122 126 144 123 159 123
Polygon -6459832 true true 201 99 214 69 215 99
Polygon -6459832 true true 207 98 223 71 220 101
Polygon -6459832 true true 184 172 189 234 203 238 203 246 187 247 180 239 171 180
Polygon -6459832 true true 197 174 204 220 218 224 219 234 201 232 195 225 179 179
Polygon -6459832 true true 78 167 95 187 95 208 79 220 92 234 98 235 100 249 81 246 76 241 61 212 65 195 52 170 45 150 44 128 55 121 69 121 81 135
Polygon -6459832 true true 48 143 58 141
Polygon -6459832 true true 46 136 68 137
Polygon -6459832 true true 45 129 35 142 37 159 53 192 47 210 62 238 80 237
Line -16777216 false 74 237 59 213
Line -16777216 false 59 213 59 212
Line -16777216 false 58 211 67 192
Polygon -6459832 true true 38 138 66 149
Polygon -6459832 true true 46 128 33 120 21 118 11 123 3 138 5 160 13 178 9 192 0 199 20 196 25 179 24 161 25 148 45 140
Polygon -6459832 true true 67 122 96 126 63 144

@#$#@#$#@
NetLogo 4.0.5
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
default
0.0
-0.2 0 0.0 1.0
0.0 1 1.0 0.0
0.2 0 0.0 1.0
link direction
true
0
Line -7500403 true 150 150 90 180
Line -7500403 true 150 150 210 180

@#$#@#$#@
