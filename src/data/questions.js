const questions = [
  // ==================== DEPORTES ====================
  // FACIL
  {
    id: 'dep_f_001',
    category: 'deportes',
    level: 'facil',
    question: '¿Cuántos jugadores hay en un equipo de fútbol?',
    options: ['9', '10', '11', '12'],
    answer: 2,
    explanation: 'Un equipo de fútbol tiene 11 jugadores incluyendo el arquero.'
  },
  {
    id: 'dep_f_002',
    category: 'deportes',
    level: 'facil',
    question: '¿En qué deporte se usa una raqueta?',
    options: ['Fútbol', 'Tenis', 'Béisbol', 'Balonmano'],
    answer: 1,
    explanation: 'El tenis se juega con raqueta, al igual que el bádminton y el squash.'
  },
  {
    id: 'dep_f_003',
    category: 'deportes',
    level: 'facil',
    question: '¿Cuántos anillos tiene el símbolo de los Juegos Olímpicos?',
    options: ['3', '4', '5', '6'],
    answer: 2,
    explanation: 'Los cinco anillos representan las cinco partes del mundo.'
  },
  {
    id: 'dep_f_004',
    category: 'deportes',
    level: 'facil',
    question: '¿Qué deportePractica Leo Messi?',
    options: ['Baloncesto', 'Fútbol', 'Tenis', 'Natación'],
    answer: 1,
    explanation: 'Lionel Messi es considerado uno de los mejores futbolista de la historia.'
  },
  {
    id: 'dep_f_005',
    category: 'deportes',
    level: 'facil',
    question: '¿Cuánto dura un partido de fútbol estándar?',
    options: ['60 minutos', '90 minutos', '120 minutos', '45 minutos'],
    answer: 1,
    explanation: 'Un partido de fútbol dura 90 minutos, divididos en dos tiempos de 45 minutos.'
  },
  // MEDIO
  {
    id: 'dep_m_001',
    category: 'deportes',
    level: 'medio',
    question: '¿En qué año se celebraron los primeros Juegos Olímpicos modernos?',
    options: ['1896', '1900', '1924', '1886'],
    answer: 0,
    explanation: 'Los primeros Juegos Olímpicos modernos se celebraron en Atenas en 1896.'
  },
  {
    id: 'dep_m_002',
    category: 'deportes',
    level: 'medio',
    question: '¿Cuántos jugadores hay en un equipo de voleibol en pista?',
    options: ['5', '6', '7', '8'],
    answer: 1,
    explanation: 'Cada equipo de voleibol tiene 6 jugadores en pista simultáneamente.'
  },
  {
    id: 'dep_m_003',
    category: 'deportes',
    level: 'medio',
    question: '¿Qué país ha ganado más medallas olímpicas en la historia?',
    options: ['China', 'Rusia', 'Estados Unidos', 'Alemania'],
    answer: 2,
    explanation: 'Estados Unidos lidera el medallero olímpico histórico.'
  },
  {
    id: 'dep_m_004',
    category: 'deportes',
    level: 'medio',
    question: '¿En qué deporte se utiliza el término "home run"?',
    options: ['Fútbol', 'Béisbol', 'Críquet', 'Golf'],
    answer: 1,
    explanation: 'El home run es un batazo que permite al bateador recorrer todas las bases.'
  },
  {
    id: 'dep_m_005',
    category: 'deportes',
    level: 'medio',
    question: '¿Cuál es el único país que ha participado en todos los Mundiales de fútbol?',
    options: ['Brasil', 'Alemania', 'Italia', 'Argentina'],
    answer: 0,
    explanation: 'Brasil es el único país que ha participado en las 22 ediciones del Mundial.'
  },
  // DIFICIL
  {
    id: 'dep_d_001',
    category: 'deportes',
    level: 'dificil',
    question: '¿En qué año se fundó el Comité Olímpico Internacional (COI)?',
    options: ['1889', '1894', '1896', '1900'],
    answer: 1,
    explanation: 'El COI fue fundado el 23 de junio de 1894 en París.'
  },
  {
    id: 'dep_d_002',
    category: 'deportes',
    level: 'dificil',
    question: '¿Cuántos puntos vale un tiro libre en rugby?',
    options: ['1 punto', '3 puntos', '5 puntos', '7 puntos'],
    answer: 2,
    explanation: 'Un try vale 5 puntos, la conversión 2 y el penalty 3.'
  },
  {
    id: 'dep_d_003',
    category: 'deportes',
    level: 'dificil',
    question: '¿Quénadador ha ganado más oros olímpicos en la historia?',
    options: ['Michael Phelps', 'Usain Bolt', 'Carl Lewis', 'Mark Spitz'],
    answer: 0,
    explanation: 'Michael Phelps tiene 23 oros olímpicos, el récord absoluto.'
  },
  {
    id: 'dep_d_004',
    category: 'deportes',
    level: 'dificil',
    question: '¿En qué consiste la regla del "sudden death" en algunos deportes?',
    options: ['Muerte súbita del jugador', 'Termina el partido inmediatamente', 'Prórroga curta', 'Penalizaciones extremas'],
    answer: 1,
    explanation: 'El sudden death termina el partido tan pronto como un equipo anota.'
  },
  {
    id: 'dep_d_005',
    category: 'deportes',
    level: 'dificil',
    question: '¿Cuántas mundiales ha ganado la selección de waterpolo de Italia?',
    options: ['3', '5', '7', '9'],
    answer: 2,
    explanation: 'Italia ha sido campeón del mundo de waterpolo 7 veces.'
  },

  // ==================== FÚTBOL ====================
  // FACIL
  {
    id: 'fut_f_001',
    category: 'futbol',
    level: 'facil',
    question: '¿Qué club ha ganado más Champions League?',
    options: ['Barcelona', 'AC Milan', 'Real Madrid', 'Bayern Múnich'],
    answer: 2,
    explanation: 'El Real Madrid ha ganado 15 Champions League, el récord absoluto.'
  },
  {
    id: 'fut_f_002',
    category: 'futbol',
    level: 'facil',
    question: '¿En qué país se inventó el fútbol moderno?',
    options: ['Brasil', 'España', 'Inglaterra', 'Italia'],
    answer: 2,
    explanation: 'Inglaterra es considerada la cuna del fútbol moderno.'
  },
  {
    id: 'fut_f_003',
    category: 'futbol',
    level: 'facil',
    question: '¿Cuántos jugadores hay en un equipo de fútbol sala?',
    options: ['4', '5', '6', '7'],
    answer: 1,
    explanation: 'El fútbol sala se juega con 5 jugadores por equipo.'
  },
  {
    id: 'fut_f_004',
    category: 'futbol',
    level: 'facil',
    question: '¿Qué significa "gol" en inglés?',
    options: ['Goal', 'Gold', 'Shoot', 'Kick'],
    answer: 0,
    explanation: 'Goal significa meta o portería en inglés.'
  },
  {
    id: 'fut_f_005',
    category: 'futbol',
    level: 'facil',
    question: '¿Qué país ganó el Mundial de 2018?',
    options: ['Brasil', 'Alemania', 'Francia', 'Argentina'],
    answer: 2,
    explanation: 'Francia ganó el Mundial de Rusia 2018 venciendo a Croacia 4-2.'
  },
  // MEDIO
  {
    id: 'fut_m_001',
    category: 'futbol',
    level: 'medio',
    question: '¿Quién es el máximo goleador en la historia de los Mundiales?',
    options: ['Ronaldo', 'Miroslav Klose', 'Pelé', 'Gerd Müller'],
    answer: 1,
    explanation: 'Miroslav Klose marcó 16 goles en Mundiales con Alemania.'
  },
  {
    id: 'fut_m_002',
    category: 'futbol',
    level: 'medio',
    question: '¿En qué año se celebró el primer Mundial de Fútbol?',
    options: ['1928', '1930', '1934', '1938'],
    answer: 1,
    explanation: 'El primer Mundial se jugó en Uruguay en 1930.'
  },
  {
    id: 'fut_m_003',
    category: 'futbol',
    level: 'medio',
    question: '¿Qué jugador tiene más Balones de Oro?',
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Michel Platini', 'Franz Beckenbauer'],
    answer: 1,
    explanation: 'Lionel Messi ha ganado 8 Balones de Oro, el récord histórico.'
  },
  {
    id: 'fut_m_004',
    category: 'futbol',
    level: 'medio',
    question: '¿Cuántos Mundiales ha ganado Brasil?',
    options: ['4', '5', '6', '7'],
    answer: 1,
    explanation: 'Brasil ha ganado 5 Mundiales: 1958, 1962, 1970, 1994 y 2002.'
  },
  {
    id: 'fut_m_005',
    category: 'futbol',
    level: 'medio',
    question: '¿Qué club es conocido como "Los Diablos Rojos"?',
    options: ['Liverpool', 'Chelsea', 'Manchester United', 'Arsenal'],
    answer: 2,
    explanation: 'Manchester United es apodado "Los Diablos Rojos".'
  },
  // DIFICIL
  {
    id: 'fut_d_001',
    category: 'futbol',
    level: 'dificil',
    question: '¿Cuántos goles marcó Just Fontaine en el Mundial de 1958?',
    options: ['10', '11', '13', '15'],
    answer: 2,
    explanation: 'Just Fontaine marcó 13 goles en un solo Mundial, récord absoluto.'
  },
  {
    id: 'fut_d_002',
    category: 'futbol',
    level: 'dificil',
    question: '¿Qué guardameta ha detenido más penaltis en la historia de los Mundiales?',
    options: ['Buffon', 'Casillas', 'Seeler', 'Kahn'],
    answer: 2,
    explanation: 'Seeler detuvo 3 penaltis en Mundiales, aunque no hay registro oficial.'
  },
  {
    id: 'fut_d_003',
    category: 'futbol',
    level: 'dificil',
    question: '¿En qué año el Sevilla FC ganó su primer título de Liga?',
    options: ['1946', '1954', '1961', 'Nunca ha ganado'],
    answer: 3,
    explanation: 'El Sevilla FC nunca ha ganado la Liga española en su historia.'
  },
  {
    id: 'fut_d_004',
    category: 'futbol',
    level: 'dificil',
    question: '¿Cuántos minutos oficiales duró el partido más largo de la historia?',
    options: ['130', '150', '160', '180'],
    answer: 2,
    explanation: 'El partido más largo duró 160 minutos (2h40min) en 1964.'
  },
  {
    id: 'fut_d_005',
    category: 'futbol',
    level: 'dificil',
    question: '¿Qué Selección Nacional tiene más subcampeones del mundo sin títulos?',
    options: ['Países Bajos', 'Hungría', 'Checoslovaquia', 'Suecia'],
    answer: 0,
    explanation: 'Países Bajos ha sido subcampeona 3 veces sin ganar ningún título.'
  },

  // ==================== BÁSQUET ====================
  // FACIL
  {
    id: 'bas_f_001',
    category: 'basquet',
    level: 'facil',
    question: '¿Cuántos jugadores hay en un equipo de baloncesto en pista?',
    options: ['4', '5', '6', '7'],
    answer: 1,
    explanation: 'Cada equipo de baloncesto tiene 5 jugadores en pista.'
  },
  {
    id: 'bas_f_002',
    category: 'basquet',
    level: 'facil',
    question: '¿En qué país se inventó el baloncesto?',
    options: ['Estados Unidos', 'Canadá', 'Inglaterra', 'Francia'],
    answer: 0,
    explanation: 'El baloncesto fue inventado por James Naismith en Estados Unidos en 1891.'
  },
  {
    id: 'bas_f_003',
    category: 'basquet',
    level: 'facil',
    question: '¿Cuántos puntos vale una canasta de tres puntos?',
    options: ['2', '3', '4', '5'],
    answer: 1,
    explanation: 'Una canasta desde fuera del arco de tres puntos vale 3 puntos.'
  },
  {
    id: 'bas_f_004',
    category: 'basquet',
    level: 'facil',
    question: '¿Qué equipo tiene más títulos de la NBA?',
    options: ['Chicago Bulls', 'Boston Celtics', 'Los Angeles Lakers', 'Golden State Warriors'],
    answer: 1,
    explanation: 'Los Boston Celtics tienen 17 campeonatos de la NBA.'
  },
  {
    id: 'bas_f_005',
    category: 'basquet',
    level: 'facil',
    question: '¿Cuánto dura un partido de baloncesto NBA?',
    options: ['40 minutos', '48 minutos', '50 minutos', '60 minutos'],
    answer: 1,
    explanation: 'Un partido NBA dura 48 minutos divididos en cuatro cuartos de 12 minutos.'
  },
  // MEDIO
  {
    id: 'bas_m_001',
    category: 'basquet',
    level: 'medio',
    question: '¿Quién es el máximo anotador de puntos en la historia de la NBA?',
    options: ['Michael Jordan', 'LeBron James', 'Kareem Abdul-Jabbar', 'Kobe Bryant'],
    answer: 2,
    explanation: 'Kareem Abdul-Jabbar tiene 38.387 puntos, el récord de la NBA.'
  },
  {
    id: 'bas_m_002',
    category: 'basquet',
    level: 'medio',
    question: '¿Cuántos anillos de campeón tiene Michael Jordan?',
    options: ['5', '6', '7', '8'],
    answer: 1,
    explanation: 'Michael Jordan ganó 6 campeonatos con los Chicago Bulls.'
  },
  {
    id: 'bas_m_003',
    category: 'basquet',
    level: 'medio',
    question: '¿En qué universidad estudió Michael Jordan?',
    options: ['Duke', 'North Carolina', 'UCLA', 'Kentucky'],
    answer: 1,
    explanation: 'Jordan estudió en la Universidad de North Carolina.'
  },
  {
    id: 'bas_m_004',
    category: 'basquet',
    level: 'medio',
    question: '¿Qué país ha ganado más medallas de oro en baloncesto olímpico?',
    options: ['Rusia', 'Argentina', 'Estados Unidos', 'España'],
    answer: 2,
    explanation: 'Estados Unidos ha ganado 16 oros olímpicos en baloncesto.'
  },
  {
    id: 'bas_m_005',
    category: 'basquet',
    level: 'medio',
    question: '¿Cuál es el diámetro del aro de baloncesto en pulgadas?',
    options: ['16 pulgadas', '17 pulgadas', '18 pulgadas', '20 pulgadas'],
    answer: 2,
    explanation: 'El diámetro del aro es de 18 pulgadas (45,7 cm).'
  },
  // DIFICIL
  {
    id: 'bas_d_001',
    category: 'basquet',
    level: 'dificil',
    question: '¿En qué draft de la NBA fue seleccionado Kobe Bryant?',
    options: ['1994', '1995', '1996', '1997'],
    answer: 2,
    explanation: 'Kobe Bryant fue seleccionado en el draft de 1996, pick 13.'
  },
  {
    id: 'bas_d_002',
    category: 'basquet',
    level: 'dificil',
    question: '¿Cuántos triples-dobles tiene Russell Westbrook en su carrera?',
    options: ['198', '214', '245', '267'],
    answer: 1,
    explanation: 'Westbrook tiene 214 triples-dobles, el récord histórico.'
  },
  {
    id: 'bas_d_003',
    category: 'basquet',
    level: 'dificil',
    question: '¿Qué equipo eligió a Wilt Chamberlain en el draft de 1959?',
    options: ['New York Knicks', 'Philadelphia Warriors', 'Boston Celtics', 'Detroit Pistons'],
    answer: 1,
    explanation: 'Los Philadelphia Warriors seleccionaron a Chamberlain en el draft.'
  },
  {
    id: 'bas_d_004',
    category: 'basquet',
    level: 'dificil',
    question: '¿Cuál fue el porcentaje de tiro más alto en una temporada NBA?',
    options: ['74.6%', '78.1%', '82.3%', '85.7%'],
    answer: 0,
    explanation: 'Wilt Chamberlain tuvo 74.6% de tiro en la temporada 1972-73.'
  },
  {
    id: 'bas_d_005',
    category: 'basquet',
    level: 'dificil',
    question: '¿Cuántos puntos marcó Wilt Chamberlain en el partido con más puntos de la historia NBA?',
    options: ['90', '100', '104', '108'],
    answer: 1,
    explanation: 'Wilt Chamberlain marcó 100 puntos el 2 de marzo de 1962.'
  },

  // ==================== TENIS ====================
  // FACIL
  {
    id: 'ten_f_001',
    category: 'tenis',
    level: 'facil',
    question: '¿Cuántos Grand Slams hay en el tenis masculino?',
    options: ['3', '4', '5', '6'],
    answer: 1,
    explanation: 'Los cuatro Grand Slams son: Australian Open, Roland Garros, Wimbledon y US Open.'
  },
  {
    id: 'ten_f_002',
    category: 'tenis',
    level: 'facil',
    question: '¿En qué superficie se juega Wimbledon?',
    options: ['Dura', 'Tierra batida', 'Césped', 'Moqueta'],
    answer: 2,
    explanation: 'Wimbledon es el único Grand Slam que se juega sobre hierba.'
  },
  {
    id: 'ten_f_003',
    category: 'tenis',
    level: 'facil',
    question: '¿Qué país ha ganado más Copas Davis?',
    options: ['España', 'Estados Unidos', 'Australia', 'Francia'],
    answer: 1,
    explanation: 'Estados Unidos ha ganado 32 Copas Davis, el récord absoluto.'
  },
  {
    id: 'ten_f_004',
    category: 'tenis',
    level: 'facil',
    question: '¿Cuántos sets necesita ganar un jugador para vencer en un partido de Grand Slam?',
    options: ['2 de 3', '2 de 5', '3 de 5', '4 de 7'],
    answer: 2,
    explanation: 'En Grand Slams se juega al mejor de 5 sets (3 de 5).'
  },
  {
    id: 'ten_f_005',
    category: 'tenis',
    level: 'facil',
    question: '¿Qué tenista es conocido como "El Rey del Clay"?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
    answer: 1,
    explanation: 'Rafael Nadal es considerado el rey de la tierra batida por sus 14 Roland Garros.'
  },
  // MEDIO
  {
    id: 'ten_m_001',
    category: 'tenis',
    level: 'medio',
    question: '¿Cuántos Grand Slams ha ganado Rafael Nadal?',
    options: ['20', '22', '24', '26'],
    answer: 1,
    explanation: 'Nadal tiene 22 Grand Slams, el récord en hombres.'
  },
  {
    id: 'ten_m_002',
    category: 'tenis',
    level: 'medio',
    question: '¿Quién es el tenista con más semanas como número 1 del ranking ATP?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
    answer: 2,
    explanation: 'Djokovic tiene más de 400 semanas como número 1, el récord.'
  },
  {
    id: 'ten_m_003',
    category: 'tenis',
    level: 'medio',
    question: '¿En qué año se jugó la primera final de Wimbledon?',
    options: ['1877', '1880', '1885', '1890'],
    answer: 0,
    explanation: 'La primera final de Wimbledon se jugó en 1877.'
  },
  {
    id: 'ten_m_004',
    category: 'tenis',
    level: 'medio',
    question: '¿Cuántos títulos de Grand Slam tiene Steffi Graf?',
    options: ['20', '22', '23', '25'],
    answer: 1,
    explanation: 'Steffi Graf tiene 22 Grand Slams en su carrera.'
  },
  {
    id: 'ten_m_005',
    category: 'tenis',
    level: 'medio',
    question: '¿Qué torneo se conoce como "El Bois"?',
    options: ['Roland Garros', 'US Open', 'Australian Open', 'Wimbledon'],
    answer: 0,
    explanation: 'Roland Garros se juega sobre tierra batida roja, llamada "la terre battue".'
  },
  // DIFICIL
  {
    id: 'ten_d_001',
    category: 'tenis',
    level: 'dificil',
    question: '¿Cuántos partidos consecutivos sin perder tuvo Martina Navratilova?',
    options: ['126', '136', '146', '156'],
    answer: 2,
    explanation: 'Navratilova encadenó 146 victorias consecutivas en 1984.'
  },
  {
    id: 'ten_d_002',
    category: 'tenis',
    level: 'dificil',
    question: '¿Qué tenista ganó el Golden Slam en un solo año?',
    options: ['Serena Williams', 'Steffi Graf', 'Margaret Court', 'Chris Evert'],
    answer: 1,
    explanation: 'Steffi Graf ganó los 4 Grand Slams + oro olímpico en 1988.'
  },
  {
    id: 'ten_d_003',
    category: 'tenis',
    level: 'dificil',
    question: '¿Cuál es el tie-break más largo de la historia en un Grand Slam?',
    options: ['36-34', '38-36', '40-38', '42-40'],
    answer: 0,
    explanation: 'El tie-break más largo fue 36-34 en el US Open 2022.'
  },
  {
    id: 'ten_d_004',
    category: 'tenis',
    level: 'dificil',
    question: '¿Cuántos aces lanzó Ivo Karlovic en su carrera ATP?',
    options: ['Menos de 10,000', 'Más de 10,000', 'Más de 13,000', 'Más de 15,000'],
    answer: 2,
    explanation: 'Karlovic tiene más de 13,000 aces en su carrera, el récord.'
  },
  {
    id: 'ten_d_005',
    category: 'tenis',
    level: 'dificil',
    question: '¿En qué fecha se jugó el partido de tenis más largo de la historia?',
    options: ['11 de enero de 2010', '22 de junio de 2010', '24 de enero de 2012', '23 de junio de 2012'],
    answer: 2,
    explanation: 'El partido más largo (5h53min) fue en el Australian Open 2012.'
  },

  // ==================== MÚSICA ====================
  // FACIL
  {
    id: 'mus_f_001',
    category: 'musica',
    level: 'facil',
    question: '¿Quién es el "Rey del Pop"?',
    options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'Freddie Mercury'],
    answer: 1,
    explanation: 'Michael Jackson es conocido como el "Rey del Pop".'
  },
  {
    id: 'mus_f_002',
    category: 'musica',
    level: 'facil',
    question: '¿Qué instrumento tiene 88 teclas?',
    options: ['Guitarra', 'Violín', 'Piano', 'Batería'],
    answer: 2,
    explanation: 'El piano estándar tiene 88 teclas (52 blancas y 36 negras).'
  },
  {
    id: 'mus_f_003',
    category: 'musica',
    level: 'facil',
    question: '¿Qué banda liderada Freddie Mercury?',
    options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'],
    answer: 2,
    explanation: 'Freddie Mercury era el líder de Queen.'
  },
  {
    id: 'mus_f_004',
    category: 'musica',
    level: 'facil',
    question: '¿Qué género musical se originó en Jamaica?',
    options: ['Salsa', 'Reggae', 'Tango', 'Flamenco'],
    answer: 1,
    explanation: 'El reggae es un género musical que se originó en Jamaica en los años 60.'
  },
  {
    id: 'mus_f_005',
    category: 'musica',
    level: 'facil',
    question: '¿Cuántos miembros tenía The Beatles?',
    options: ['3', '4', '5', '6'],
    answer: 1,
    explanation: 'The Beatles estaba formado por John, Paul, George y Ringo.'
  },
  // MEDIO
  {
    id: 'mus_m_001',
    category: 'musica',
    level: 'medio',
    question: '¿En qué década se fundó la banda The Beatles?',
    options: ['1950s', '1960s', '1970s', '1980s'],
    answer: 1,
    explanation: 'The Beatles se fundó en Liverpool en 1960.'
  },
  {
    id: 'mus_m_002',
    category: 'musica',
    level: 'medio',
    question: '¿Qué álbum de Michael Jackson es el más vendido de la historia?',
    options: ['Bad', 'Dangerous', 'Thriller', 'Off the Wall'],
    answer: 2,
    explanation: 'Thriller es el álbum más vendido de la historia con más de 66 millones.'
  },
  {
    id: 'mus_m_003',
    category: 'musica',
    level: 'medio',
    question: '¿Qué instrumento principal toca Luis Fonsi?',
    options: ['Guitarra', 'Piano', 'Bajo', 'Voz'],
    answer: 3,
    explanation: 'Luis Fonsi es cantante, aunque también toca la guitarra.'
  },
  {
    id: 'mus_m_004',
    category: 'musica',
    level: 'medio',
    question: '¿Cuál fue el primer single de The Beatles en alcanzar el número 1 en EE.UU.?',
    options: ['Love Me Do', 'I Want to Hold Your Hand', 'She Loves You', 'Help!'],
    answer: 1,
    explanation: 'I Want to Hold Your Hand fue el primer hit #1 de The Beatles en EE.UU.'
  },
  {
    id: 'mus_m_005',
    category: 'musica',
    level: 'medio',
    question: '¿Qué banda de rock发表了专辑 "The Dark Side of the Moon"?',
    options: ['Led Zeppelin', 'Pink Floyd', 'The Who', 'Genesis'],
    answer: 1,
    explanation: 'Pink Floyd lanzó "The Dark Side of the Moon" en 1973.'
  },
  // DIFICIL
  {
    id: 'mus_d_001',
    category: 'musica',
    level: 'dificil',
    question: '¿Cuántas Grammys ha ganado Beyoncé?',
    options: ['28', '32', '35', '40'],
    answer: 2,
    explanation: 'Beyoncé tiene 35 Grammys, el récord histórico.'
  },
  {
    id: 'mus_d_002',
    category: 'musica',
    level: 'dificil',
    question: '¿Qué canción tiene el récord de semanas en el Billboard Hot 100?',
    options: ['Despacito', 'Old Town Road', 'One Sweet Day', 'Shape of You'],
    answer: 1,
    explanation: 'Old Town Road de Lil Nas X estuvo 19 semanas en el #1.'
  },
  {
    id: 'mus_d_003',
    category: 'musica',
    level: 'dificil',
    question: '¿En qué año murió Kurt Cobain?',
    options: ['1991', '1992', '1993', '1994'],
    answer: 3,
    explanation: 'Kurt Cobain murió el 5 de abril de 1994.'
  },
  {
    id: 'mus_d_004',
    category: 'musica',
    level: 'dificil',
    question: '¿Qué álbum fue grabado en un solo take en Abbey Road?',
    options: ['Sgt. Pepper', 'Abbey Road', 'Let It Be', 'The Beatles'],
    answer: 2,
    explanation: 'Let It Be fue grabado casi completamente en un solo take.'
  },
  {
    id: 'mus_d_005',
    category: 'musica',
    level: 'dificil',
    question: '¿Cuántas octavas puede cantar Mariah Carey?',
    options: ['3', '4', '5', '6'],
    answer: 2,
    explanation: 'Mariah Carey tiene un rango vocal de aproximadamente 5 octavas.'
  },

  // ==================== GENERAL ====================
  // FACIL
  {
    id: 'gen_f_001',
    category: 'general',
    level: 'facil',
    question: '¿Cuántos continentes hay en la Tierra?',
    options: ['5', '6', '7', '8'],
    answer: 2,
    explanation: 'Hay 7 continentes: Asia, África, América del Norte, América del Sur, Antártida, Europa y Oceanía.'
  },
  {
    id: 'gen_f_002',
    category: 'general',
    level: 'facil',
    question: '¿Qué planeta es conocido como el "Planeta Rojo"?',
    options: ['Venus', 'Marte', 'Júpiter', 'Saturno'],
    answer: 1,
    explanation: 'Marte es llamado el "Planeta Rojo" por su color óxido de hierro.'
  },
  {
    id: 'gen_f_003',
    category: 'general',
    level: 'facil',
    question: '¿Cuál es el océano más grande del mundo?',
    options: ['Atlántico', 'Índico', 'Ártico', 'Pacífico'],
    answer: 3,
    explanation: 'El Océano Pacífico es el más grande, cubriendo约占地球面积的三分之一。'
  },
  {
    id: 'gen_f_004',
    category: 'general',
    level: 'facil',
    question: '¿Qué país tiene la Gran Muralla China?',
    options: ['Japón', 'China', 'Corea del Norte', 'Mongolia'],
    answer: 1,
    explanation: 'La Gran Muralla China se encuentra en China.'
  },
  {
    id: 'gen_f_005',
    category: 'general',
    level: 'facil',
    question: '¿Cuántos días tiene un año bisiesto?',
    options: ['364', '365', '366', '367'],
    answer: 2,
    explanation: 'Un año bisiesto tiene 366 días porque febrero tiene 29 días.'
  },
  // MEDIO
  {
    id: 'gen_m_001',
    category: 'general',
    level: 'medio',
    question: '¿En qué año llegó el hombre a la Luna?',
    options: ['1965', '1967', '1969', '1971'],
    answer: 2,
    explanation: 'Neil Armstrong llegó a la Luna el 20 de julio de 1969.'
  },
  {
    id: 'gen_m_002',
    category: 'general',
    level: 'medio',
    question: '¿Cuál es el río más largo del mundo?',
    options: ['Amazonas', 'Nilo', 'Yangtsé', 'Misisipi'],
    answer: 1,
    explanation: 'El río Nilo tiene aproximadamente 6.650 km, el más largo.'
  },
  {
    id: 'gen_m_003',
    category: 'general',
    level: 'medio',
    question: '¿Qué elemento químico tiene el símbolo "Au"?',
    options: ['Plata', 'Oro', 'Aluminio', 'Argón'],
    answer: 1,
    explanation: 'Au viene del latín "aurum" que significa oro.'
  },
  {
    id: 'gen_m_004',
    category: 'general',
    level: 'medio',
    question: '¿Cuántos huesos tiene el cuerpo humano adulto?',
    options: ['186', '196', '206', '216'],
    answer: 2,
    explanation: 'El cuerpo humano adulto tiene 206 huesos.'
  },
  {
    id: 'gen_m_005',
    category: 'general',
    level: 'medio',
    question: '¿En qué país se encuentra la Torre Eiffel?',
    options: ['Italia', 'España', 'Francia', 'Alemania'],
    answer: 2,
    explanation: 'La Torre Eiffel está en París, Francia, y fue construida en 1889.'
  },
  // DIFICIL
  {
    id: 'gen_d_001',
    category: 'general',
    level: 'dificil',
    question: '¿Cuál es el país con más islas en el mundo?',
    options: ['Indonesia', 'Filipinas', 'Suecia', 'Finlandia'],
    answer: 2,
    explanation: 'Suecia tiene aproximadamente 267.000 islas, el récord mundial.'
  },
  {
    id: 'gen_d_002',
    category: 'general',
    level: 'dificil',
    question: '¿Qué científico formuló la teoría de la relatividad?',
    options: ['Isaac Newton', 'Albert Einstein', 'Stephen Hawking', 'Niels Bohr'],
    answer: 1,
    explanation: 'Albert Einstein formuló la teoría de la relatividad en 1905 y 1915.'
  },
  {
    id: 'gen_d_003',
    category: 'general',
    level: 'dificil',
    question: '¿Cuánto dura aproximadamente un día en Mercurio?',
    options: ['24 horas', '59 días', '88 días', '176 días'],
    answer: 1,
    explanation: 'Un día en Mercurio dura 59 días terrestres.'
  },
  {
    id: 'gen_d_004',
    category: 'general',
    level: 'dificil',
    question: '¿Qué porcentaje del cuerpo humano es agua?',
    options: ['50-55%', '60-65%', '70-75%', '80-85%'],
    answer: 1,
    explanation: 'El cuerpo humano está compuesto aproximadamente de 60-65% de agua.'
  },
  {
    id: 'gen_d_005',
    category: 'general',
    level: 'dificil',
    question: '¿Cuál es el punto más profundo del océano?',
    options: ['Fosa de las Marianas', 'Fosa de Tonga', 'Fosa de Filipinas', 'Fosa de Puerto Rico'],
    answer: 0,
    explanation: 'La Fosa de las Marianas tiene 11.034 metros de profundidad.'
  }
]

export default questions