;;;
;;;  =================================================================
;;;
;;;      Defini��o do mundo da simula��o
;;;
;;;  =================================================================
;;;

;;;
;;;  Variaveis globais e constantes
;;;
globals [CHAO PRATELEIRA RAMPA PAREDE SEM_CARGA AZUL VERDE AMARELO VERMELHO]

;;;
;;;  Declara��o dos dois tipos de turtles
;;;
breed [ robots robot ]
breed [ caixas caixa ]

;;;
;;;  Declara as propriedades das celulas na grelha
;;;
patches-own [tipo pcor]

;;;
;;; Declara��o de propriedades dos robots
;;;

robots-own [carrego] 
;; carrego: indica o id da caixa que est� a carregar. 
;;          SEM_CARGA se n�o estiver a carregar nada

;;;
;;;  As caixas tem a propriedade cor
;;;
caixas-own [cor]

;;;
;;;  Reinicia a simula��o
;;;
to reset
  clear-all
  set-globals
  setup-patches
  setup-turtles
  ask robots [inicia-robot]
end

;;;
;;;  Prepara os agentes. Cria as caixas e os robots
;;;
to setup-turtles
  create-robots 3
  
  ;; set robot 1
  set [color] of turtle 0 sky
  set [xcor] of turtle 0 -5
  set [ycor] of turtle 0 -3
  set [heading] of turtle 0 90
  set [carrego] of turtle 0 SEM_CARGA

  ;; set robot 2
  set [color] of turtle 1 orange
  set [xcor] of turtle 1 -5
  set [ycor] of turtle 1 -4
  set [heading] of turtle 1 90
  set [carrego] of turtle 1 SEM_CARGA

  ;; set robot 3
  set [color] of turtle 2 magenta
  set [xcor] of turtle 2 -5
  set [ycor] of turtle 2 -5
  set [heading] of turtle 2 90
  set [carrego] of turtle 2 SEM_CARGA

  set-default-shape caixas "box"
  create-caixas 8

  ;; set caixa 1
  set [color] of turtle 3 blue + 2
  set [xcor] of turtle 3 -1
  set [ycor] of turtle 3 -5
  set [heading] of turtle 3 0
  set [size] of turtle 3 0.7
  set [cor] of turtle 3 AZUL

  ;; set caixa 2
  set [color] of turtle 4 red + 2
  set [xcor] of turtle 4 -1
  set [ycor] of turtle 4 -4
  set [heading] of turtle 4 0
  set [size] of turtle 4 0.7
  set [cor] of turtle 4 VERMELHO

  ;; set caixa 3
  set [color] of turtle 5 yellow + 2
  set [xcor] of turtle 5 -1
  set [ycor] of turtle 5 -3
  set [heading] of turtle 5 0
  set [size] of turtle 5 0.7
  set [cor] of turtle 5 AMARELO

  ;; set caixa 4
  set [color] of turtle 6 green + 2
  set [xcor] of turtle 6 0
  set [ycor] of turtle 6 -3
  set [heading] of turtle 6 0
  set [size] of turtle 6 0.7
  set [cor] of turtle 6 VERDE

  ;; set caixa 5
  set [color] of turtle 7 blue + 2
  set [xcor] of turtle 7 1
  set [ycor] of turtle 7 -3
  set [heading] of turtle 7 0
  set [size] of turtle 7 0.7
  set [cor] of turtle 7 AZUL

  ;; set caixa 6
  set [color] of turtle 8 red + 2
  set [xcor] of turtle 8 2
  set [ycor] of turtle 8 -3
  set [heading] of turtle 8 0
  set [size] of turtle 8 0.7  
  set [cor] of turtle 8 VERMELHO

  ;; set caixa 7
  set [color] of turtle 9 yellow + 2
  set [xcor] of turtle 9 2
  set [ycor] of turtle 9 -4
  set [heading] of turtle 9 0
  set [size] of turtle 9 0.7
  set [cor] of turtle 9 AMARELO

  ;; set caixa 8
  set [color] of turtle 10 green + 2
  set [xcor] of turtle 10 2
  set [ycor] of turtle 10 -5
  set [heading] of turtle 10 0
  set [size] of turtle 10 0.7
  set [cor] of turtle 10 VERDE
end

;;;
;;;  Prepara o ambiente. Cria o armaz�m
;;;
to setup-patches
  ;; coloca ch�o
  ask patches [
    set tipo CHAO
    set pcolor gray + 4 ]
    
  ;; coloca parede
  foreach [-6 -5 -4 -3 -2 -1 1 0 1 2 3 4 5 6]
    [ set [pcolor] of patch ? -6 black
      set [tipo] of patch ? -6 PAREDE
      set [pcolor] of patch ? 6 black
      set [tipo] of patch ? 6 PAREDE
      set [pcolor] of patch -6 ? black
      set [tipo] of patch -6 ? PAREDE
      set [pcolor] of patch 6 ? black
      set [tipo] of patch 6 ? PAREDE]

  ;; coloca rampa  
  foreach [-1 0 1 2] [
    set [pcolor] of patch ? -5 gray + 3
    set [tipo] of patch ? -5 RAMPA
    set [pcolor] of patch ? -4 gray + 3
    set [tipo] of patch ? -4 RAMPA
    set [pcolor] of patch ? -3 gray + 3
    set [tipo] of patch ? -3 RAMPA
  ]

  ;; prateleira azul  
  set [pcolor] of patch -5 4 blue
  set [tipo] of patch -5 4 PRATELEIRA
  set [pcor] of patch -5 4 AZUL
  set [pcolor] of patch -4 4 blue
  set [tipo] of patch -4 4 PRATELEIRA
  set [pcor] of patch -4 4 AZUL
  
  ;; prateleira amarela
  set [pcolor] of patch 5 4 yellow
  set [tipo] of patch 5 4 PRATELEIRA
  set [pcor] of patch 5 4 AMARELO
  set [pcolor] of patch 4 4 yellow
  set [tipo] of patch 4 4 PRATELEIRA
  set [pcor] of patch 4 4 AMARELO
  
  ;; prateleira verde
  set [pcolor] of patch 5 2 green
  set [tipo] of patch 5 2 PRATELEIRA
  set [pcor] of patch 5 2 VERDE
  set [pcolor] of patch 4 2 green
  set [tipo] of patch 4 2 PRATELEIRA
  set [pcor] of patch 4 2 VERDE
  
  ;; prateleira vermelha
  set [pcolor] of patch -5 2 red
  set [tipo] of patch -5 2 PRATELEIRA
  set [pcor] of patch -5 2 VERMELHO
  set [pcolor] of patch -4 2 red
  set [tipo] of patch -4 2 PRATELEIRA
  set [pcor] of patch -4 2 VERMELHO
end

;;;
;;;  Inicia o valor das variaveis globais
;;;
to set-globals 
  set SEM_CARGA 0
  set CHAO 1
  set PRATELEIRA 2
  set RAMPA 3
  set PAREDE 4
  set AZUL 10
  set VERDE 11
  set AMARELO 12
  set VERMELHO 13
end

;;;
;;;  Conta o n�mero de caixas arrumadas
;;;
to-report caixas-arrumadas
  let num-caixas 0
    
  foreach [who] of caixas
  [ ask turtle ? 
    [ if [tipo] of patch-here = PRATELEIRA
      [ set num-caixas (num-caixas + 1) ]
    ]
  ]
  report num-caixas
end

;;;
;;;  Devolve o n�mero de agentes que est�o na posi��o inicial
;;;
to-report robots-posicao-initial
  let num-robots 0
  let posicoes [-5 -3  ; robot 1
                -5 -4  ; robot 2
                -5 -5] ; robot 3
    
  foreach [0 1 2] ; ids dos 3 robot
  [ ask turtle ?
    [ if xcor = item (2 * ?) posicoes and
         ycor = item (2 * ? + 1) posicoes
      [ set num-robots (num-robots + 1) ]
    ] 
  ]
  
  report num-robots
end

;;;
;;;  Avan�a o estado da simula��o
;;;
to go
  tick
  ;; os robots agem
  ask robots [
      ciclo-robot
  ]
  ;; verifica se a tarefa terminou
  ;; est�o 8 caixas arrumadas e os 3 robots na posi��o inicial.
  if caixas-arrumadas = 8 and robots-posicao-initial = 3
    [ stop ]  
end

;;;
;;;  NOTA: N�o alterar nada acima desta linha!!!
;;;

;;;
;;;  =================================================================
;;;
;;;      Defini��o dos agentes
;;;
;;;  =================================================================
;;;

;;;
;;;  Precedimento que inicia o estado dos robots
;;;
to inicia-robot
  set carrego SEM_CARGA
end

;;;
;;;  Procedimento de actualiza��o dos robots, implementa as regras de comportamento
;;;
to ciclo-robot
  if
    ifelse (celula-livre?) 
      [mover-frente]
      [ifelse not(carrego-caixa?) and (celula-contem-caixa?) and (celula-rampa?)
      [apanhar-caixa]
      [ifelse (celula-prateleira?) and (carrego-caixa?) and (cor-caixa-que-carrego? = cor-celula?) and not(celula-contem-caixa?)
      [largar-caixa]
      [rodar-aleatorio]]]
end

;;;
;;; ------------------------
;;;   Fun��es auxiliares
;;; ------------------------
;;;

;;;
;;;  Devolve a caixa que est� em frente ao robot.
;;;  Devolve 'nobody' se n�o encontrar nenhuma caixa.
;;;
to-report caixa-em-frente
  report one-of caixas-on patch-ahead 1
end

;;;
;;;  Movimenta a caixa que o robot carrega para a posi��o actual do robot
;;;
to mover-caixa
  set [xcor] of carrego xcor
  set [ycor] of carrego ycor
end

;;;
;;; ------------------------
;;;   Actuadores
;;; ------------------------
;;;

;;;
;;;  Movimenta o robot uma celula em frente
;;;
to mover-frente
  let frente (patch-ahead 1)  
  ;; verifica se a celula est� livre
  if ([tipo] of frente = CHAO) and (not any? robots-on frente)
  [ fd 1
    if not (carrego = SEM_CARGA)
    [mover-caixa] ]
end

to rodar-esquerda
  lt 90
end

to rodar-direita
  rt 90
end

to rodar-aleatorio
  let rand (random 4)
  if rand = 0 [set heading (heading + 0)]
  if rand = 1 [set heading (heading + 90)]     
  if rand = 2 [set heading (heading + 180)]
  if rand = 3 [set heading (heading + 270)]  
end

to apanhar-caixa
  set carrego (caixa-em-frente)
  mover-caixa
end

to largar-caixa
   let frente (patch-ahead 1)
   set [xcor] of carrego ([pxcor] of frente)
   set [ycor] of carrego ([pycor] of frente)
   set carrego SEM_CARGA
end

;;;
;;; ------------------------
;;;   Sensores
;;; ------------------------
;;;

;;;
;;;  Verifica se o robot est� a carregar uma caixa
;;;
to-report carrego-caixa? 
  report not (carrego = SEM_CARGA)
end

;;;
;;;  Verifica a cor da caixa que o robot carrega
;;;
to-report cor-caixa-que-carrego?
  ifelse carrego-caixa?
    [ report [cor] of carrego ]
    [ report SEM_CARGA ]
end

to-report cor-caixa-frente?
  let celula celula-contem-caixa?
  if  celula != nobody 
    [ report [pcor] of celula ]
end

to-report cor-celula?
  let frente (patch-ahead 1) 
  ifelse (celula-contem-caixa?) 
  [report [pcor] of frente]
  [ifelse (celula-prateleira?)
  [report [pcor] of frente]
  [report [pcolor] of frente]]
end

to-report celula-livre?
  let frente (patch-ahead 1)  
  ;; verifica se a celula est� livre
  if ([tipo] of frente = CHAO) and (not any? robots-on frente)
    [report true]
  report false
end

to-report celula-contem-caixa?
  ifelse caixa-em-frente != nobody
    [report true]
    [report false]
end

to-report celula-prateleira?
  let frente (patch-ahead 1)  
  ;; verifica se a celula est� livre
  if ([tipo] of frente = PRATELEIRA)
    [report true]
  report false
end

to-report celula-rampa?
  let frente (patch-ahead 1)  
  ;; verifica se a celula est� livre
  if ([tipo] of frente = RAMPA)
    [report true]
  report false
end

@#$#@#$#@
GRAPHICS-WINDOW
321
10
591
301
6
6
20.0
1
10
1
1
1
0
1
1
1
-6
6
-6
6
0
0
1
ticks

CC-WINDOW
5
315
600
410
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
27
199
60
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
230
27
298
60
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

MONITOR
29
71
143
116
Caixas arrumadas
caixas-arrumadas
0
1
11

MONITOR
150
71
300
116
Robots na posi��o inicial
robots-posicao-initial
0
1
11

@#$#@#$#@
O QUE � ESTE MODELO?
--------------------
O Loading Docks � um cen�rio de estudo usado em sistemas multi-agentes . Este cen�rio retrata um armaz�m onde s�o usados robots (agentes) com o objectivo de arrumar caixas, previamente colocadas numa rampa, em prateleiras pr�prias.

O armaz�m do Loading Docks consiste numa �rea rectangular, onde est�o dispostas prateleiras de diferentes cores e uma rampa onde as caixas que devem ser arrumadas s�o inicialmente colocadas. O ch�o do armaz�m � representado por uma grelha rectangular. 

Todos os objectos no mundo (incluindo os agentes) t�m uma forma regular, pelo que cada um destes elementos � mapeado em unidades da grelha.

Cen�rio na situa��o inicial:
 ------------
|            |
|BB        AA| prateleiras azul e amarela
|            |
|EE        VV| prateleira encarnada e verde
|            |
|            |
|    ----    |
|x  |aveb|   | agente, caixa amarela, verde, encarnada e azul
|x  |e  v|   | agente, caixa encarnada e verde
|x  |b  a|   | agente, caixa azul e amarela
 ------------

Entidades existentes:
Robot: � representado no mundo por um agente (x - turtle pertencente ao breed robot) que tem por objectivo transportar as caixas a partir da rampa e arrum�-las nas prateleiras existentes. Cada agente ocupa uma unidade da grelha em cada instante. O agente tem uma orienta��o e pode olhar para a c�lula da grelha que tem � sua frente (definida pela sua orienta��o actual). O agente pode ainda observar o seu pr�prio estado de modo a saber se est� ou n�o a transportar uma caixa e de que cor � a caixa que transporta.

Rampa: � um objecto est�tico (n�o pode mudar de posi��o - zona central - patch) onde s�o depositadas as caixas inicialmente. O armaz�m cont�m apenas uma rampa com capacidade para sustentar 8 caixas.

Prateleira: � um objecto est�tico (letras mai�sculas - patch) caracterizado por uma cor onde s�o arrumadas as caixas. As caixas s� podem ser arrumadas em prateleiras de cor igual (ex: as caixas vermelhas s� podem ser arrumadas nas prateleiras vermelhas). O mundo cont�m 4 prateleiras com capacidade para duas caixas.

Caixa: � um objecto transport�vel (letras min�sculas - turtle pertencente ao breed caixa) inicialmente colocado na rampa. As caixas podem ser transportadas pelos agentes e colocadas nas prateleiras.

O agente pode avan�ar uma c�lula de cada vez no sentido da sua orienta��o. No entanto n�o se pode movimentar para uma c�lula ocupada (por outro agente ou objecto) nem sair fora dos limites do armaz�m.

O agente pode rodar e mudar a sua orienta��o 90� para a esquerda ou para a direita. 

Um agente que n�o transporte qualquer caixa pode apanhar uma caixa da rampa desde que esta esteja na c�lula directamente � sua frente. Um agente pode apenas transportar uma caixa de cada vez e s� a pode largar na respectiva prateleira (n�o se podem largar caixas no ch�o do armaz�m). Os agentes n�o podem trocar caixas entre si. Para arrumar uma caixa na prateleira o agente precisa de estar situado em frente � prateleira. O agente coloca a caixa na c�lula � sua frente, por isso tem de estar correctamente orientado para a arrumar e em frente a uma posi��o livre da prateleira.
 
O objectivo � alcan�ado quando todas as caixas est�o arrumadas nas prateleiras da cor correspondente e os agentes posicionados na sua localiza��o inicial.


COMO FUNCIONA?
--------------
Esta primeira vers�o � muito simples (e muito pouco inteligente).
O agente sabe mover-se para a frente e, no caso de carregar uma caixa, sabe traz�-la consigo. Sabe virar-se para a esquerda e para a direita.
Neste momento, o procedimento ciclo-robot, que � o respons�vel pelo movimento do agente, limita-se a tentar movimentar-se para a frente, independentemente de poder ou n�o. O procedimento mover-frente s� produz modifica��es no mundo quando o agente pode avan�ar (isto �, quando a c�lula da frente � ch�o e n�o est� ocupada por nenhum robot).


COMO UTILIZAR?
--------------
A primeira parte dos procedimentos � respons�vel pela defini��o do ambiente e por colocar os agentes e as caixas nas posi��es iniciais.
A segunda parte define o tipo de turtles utilizadas e coloca-as nas posi��es desejadas.


AUTORIA:
--------
Corpo docente de AASMA.
Adaptado de Rui Prada.
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
