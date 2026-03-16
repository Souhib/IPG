"""Codenames game seed data — Islamic word packs."""

from uuid import uuid4

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from ipg.api.models.codenames import CodenamesWord, CodenamesWordPack

CODENAMES_WORD_PACKS: dict[str, list[dict[str, str | dict[str, str]]]] = {
    "Prophets & Messengers": [
        {"word": "Adam", "hint": {"en": "The first human and prophet created by Allah", "ar": "أول إنسان ونبي خلقه الله", "fr": "Le premier humain et prophète créé par Allah"}},
        {"word": "Nuh", "hint": {"en": "Prophet Noah, who built the Ark to survive the great flood", "ar": "النبي نوح، الذي بنى السفينة للنجاة من الطوفان العظيم", "fr": "Le prophète Noé, qui construisit l'Arche pour survivre au déluge"}},
        {"word": "Ibrahim", "hint": {"en": "Prophet Abraham, father of monotheism", "ar": "النبي إبراهيم، أبو الأنبياء ورمز التوحيد", "fr": "Le prophète Abraham, père du monothéisme"}},
        {"word": "Ismail", "hint": {"en": "Prophet Ishmael, son of Ibrahim and ancestor of the Arabs", "ar": "النبي إسماعيل، ابن إبراهيم وجد العرب", "fr": "Le prophète Ismaël, fils d'Ibrahim et ancêtre des Arabes"}},
        {"word": "Ishaq", "hint": {"en": "Prophet Isaac, son of Ibrahim and father of Yaqub", "ar": "النبي إسحاق، ابن إبراهيم وأبو يعقوب", "fr": "Le prophète Isaac, fils d'Ibrahim et père de Yaqub"}},
        {"word": "Yaqub", "hint": {"en": "Prophet Jacob, also known as Israel, father of the twelve tribes", "ar": "النبي يعقوب، المعروف أيضاً بإسرائيل، أبو الأسباط الاثني عشر", "fr": "Le prophète Jacob, aussi connu comme Israël, père des douze tribus"}},
        {"word": "Yusuf", "hint": {"en": "Prophet Joseph, known for his beauty and the story of his brothers", "ar": "النبي يوسف، المعروف بجماله وقصته مع إخوته", "fr": "Le prophète Joseph, connu pour sa beauté et l'histoire de ses frères"}},
        {"word": "Musa", "hint": {"en": "Prophet Moses, who received the Torah and parted the sea", "ar": "النبي موسى، الذي أُنزلت عليه التوراة وشق البحر", "fr": "Le prophète Moïse, qui reçut la Torah et fendit la mer"}},
        {"word": "Harun", "hint": {"en": "Prophet Aaron, brother and helper of Musa", "ar": "النبي هارون، أخو موسى ومعاونه", "fr": "Le prophète Aaron, frère et assistant de Moïse"}},
        {"word": "Dawud", "hint": {"en": "Prophet David, king and psalmist who received the Zabur", "ar": "النبي داوود، الملك الذي أُنزل عليه الزبور", "fr": "Le prophète David, roi et psalmiste qui reçut le Zabour"}},
        {"word": "Sulayman", "hint": {"en": "Prophet Solomon, known for his wisdom and kingdom over humans and jinn", "ar": "النبي سليمان، المعروف بحكمته وملكه على الإنس والجن", "fr": "Le prophète Salomon, connu pour sa sagesse et son royaume sur les humains et les djinns"}},
        {"word": "Isa", "hint": {"en": "Prophet Jesus, born miraculously to Maryam", "ar": "النبي عيسى، ولد بمعجزة لمريم", "fr": "Le prophète Jésus, né miraculeusement de Maryam"}},
        {"word": "Muhammad", "hint": {"en": "The final Prophet and Messenger of Allah, seal of the prophets", "ar": "النبي محمد، خاتم الأنبياء والمرسلين", "fr": "Le dernier Prophète et Messager d'Allah, sceau des prophètes"}},
        {"word": "Ayyub", "hint": {"en": "Prophet Job, symbol of patience through severe trials", "ar": "النبي أيوب، رمز الصبر على البلاء الشديد", "fr": "Le prophète Job, symbole de patience face aux épreuves"}},
        {"word": "Yunus", "hint": {"en": "Prophet Jonah, who was swallowed by a whale and repented", "ar": "النبي يونس، الذي ابتلعه الحوت فتاب إلى الله", "fr": "Le prophète Jonas, avalé par une baleine et qui se repentit"}},
        {"word": "Idris", "hint": {"en": "Prophet Enoch, known for his piety and knowledge", "ar": "النبي إدريس، المعروف بتقواه وعلمه", "fr": "Le prophète Énoch, connu pour sa piété et son savoir"}},
        {"word": "Hud", "hint": {"en": "Prophet sent to the people of 'Ad, who rejected his message", "ar": "النبي هود، أُرسل إلى قوم عاد الذين رفضوا رسالته", "fr": "Prophète envoyé au peuple de 'Ad, qui rejeta son message"}},
        {"word": "Salih", "hint": {"en": "Prophet sent to the people of Thamud with the miracle of the she-camel", "ar": "النبي صالح، أُرسل إلى قوم ثمود بمعجزة الناقة", "fr": "Prophète envoyé au peuple de Thamoud avec le miracle de la chamelle"}},
        {"word": "Shuayb", "hint": {"en": "Prophet sent to the people of Madyan, known as the orator of the prophets", "ar": "النبي شعيب، أُرسل إلى أهل مدين، خطيب الأنبياء", "fr": "Prophète envoyé au peuple de Madyan, connu comme l'orateur des prophètes"}},
        {"word": "Lut", "hint": {"en": "Prophet Lot, nephew of Ibrahim who warned his people against immorality", "ar": "النبي لوط، ابن أخي إبراهيم الذي حذر قومه من الفاحشة", "fr": "Le prophète Loth, neveu d'Ibrahim qui avertit son peuple contre l'immoralité"}},
    ],
    "Quran & Surahs": [
        {"word": "Fatiha", "hint": {"en": "The Opening — first surah of the Quran, recited in every prayer", "ar": "الفاتحة — أول سورة في القرآن، تُقرأ في كل صلاة", "fr": "L'Ouverture — première sourate du Coran, récitée dans chaque prière"}},
        {"word": "Baqarah", "hint": {"en": "The Cow — longest surah in the Quran", "ar": "البقرة — أطول سورة في القرآن الكريم", "fr": "La Vache — la plus longue sourate du Coran"}},
        {"word": "Yasin", "hint": {"en": "Often called the heart of the Quran", "ar": "يس — تُسمى قلب القرآن", "fr": "Souvent appelée le cœur du Coran"}},
        {"word": "Rahman", "hint": {"en": "The Most Merciful — known for the refrain 'Which of your Lord's favors will you deny?'", "ar": "الرحمن — المعروفة بتكرار 'فبأي آلاء ربكما تكذبان'", "fr": "Le Tout Miséricordieux — connue pour le refrain 'Lequel des bienfaits de votre Seigneur nierez-vous ?'"}},
        {"word": "Mulk", "hint": {"en": "The Sovereignty — protects from the punishment of the grave", "ar": "الملك — تقي من عذاب القبر", "fr": "La Royauté — protège du châtiment de la tombe"}},
        {"word": "Kahf", "hint": {"en": "The Cave — recommended to read on Fridays, contains four stories", "ar": "الكهف — يُستحب قراءتها يوم الجمعة، تحتوي أربع قصص", "fr": "La Caverne — recommandée le vendredi, contient quatre récits"}},
        {"word": "Maryam", "hint": {"en": "Surah named after Mary, mother of Prophet Isa", "ar": "سورة مريم — سُميت على اسم مريم أم النبي عيسى", "fr": "Sourate nommée d'après Marie, mère du prophète Jésus"}},
        {"word": "Taha", "hint": {"en": "Surah beginning with mystical letters, recounts the story of Musa", "ar": "سورة طه — تبدأ بحروف مقطعة وتروي قصة موسى", "fr": "Sourate commençant par des lettres mystiques, raconte l'histoire de Moïse"}},
        {"word": "Naba", "hint": {"en": "The Great News — about the Day of Judgment", "ar": "النبأ — عن يوم القيامة", "fr": "La Nouvelle — à propos du Jour du Jugement"}},
        {"word": "Ikhlas", "hint": {"en": "Purity of Faith — equal to one-third of the Quran in reward", "ar": "الإخلاص — تعادل ثلث القرآن في الأجر", "fr": "La Pureté de la Foi — équivalente à un tiers du Coran en récompense"}},
        {"word": "Falaq", "hint": {"en": "The Daybreak — a protective surah seeking refuge from evil", "ar": "الفلق — سورة حماية يُستعاذ بها من الشر", "fr": "L'Aube naissante — sourate protectrice contre le mal"}},
        {"word": "Nas", "hint": {"en": "Mankind — the final surah, seeking refuge from the whisperer", "ar": "الناس — آخر سورة، يُستعاذ بها من الوسواس", "fr": "Les Hommes — dernière sourate, cherchant refuge contre le tentateur"}},
        {"word": "Ayah", "hint": {"en": "A verse of the Quran, also means 'sign' from God", "ar": "آية — جملة من القرآن، تعني أيضاً 'علامة' من الله", "fr": "Un verset du Coran, signifie aussi 'signe' de Dieu"}},
        {"word": "Juz", "hint": {"en": "One of 30 equal parts of the Quran", "ar": "جزء — واحد من ثلاثين جزءاً متساوياً من القرآن", "fr": "L'une des 30 parties égales du Coran"}},
        {"word": "Hizb", "hint": {"en": "Half a Juz — the Quran is divided into 60 Hizbs", "ar": "حزب — نصف جزء، القرآن مقسم إلى 60 حزباً", "fr": "La moitié d'un Juz — le Coran est divisé en 60 Hizbs"}},
        {"word": "Tanzil", "hint": {"en": "The revelation or sending down of the Quran from God", "ar": "التنزيل — إنزال القرآن من عند الله", "fr": "La révélation ou la descente du Coran de Dieu"}},
        {"word": "Tafsir", "hint": {"en": "Exegesis and interpretation of the Quran", "ar": "التفسير — شرح وتأويل القرآن الكريم", "fr": "L'exégèse et l'interprétation du Coran"}},
        {"word": "Tajweed", "hint": {"en": "The rules of proper Quran recitation and pronunciation", "ar": "التجويد — قواعد تلاوة القرآن ونطقه الصحيح", "fr": "Les règles de récitation correcte et de prononciation du Coran"}},
        {"word": "Tilawah", "hint": {"en": "The act of reciting the Quran aloud", "ar": "التلاوة — قراءة القرآن جهراً", "fr": "L'acte de réciter le Coran à voix haute"}},
        {"word": "Mushaf", "hint": {"en": "The physical written copy of the Quran", "ar": "المصحف — النسخة المكتوبة من القرآن الكريم", "fr": "L'exemplaire physique écrit du Coran"}},
    ],
    "Islamic History": [
        {"word": "Hijrah", "hint": {"en": "The Prophet's migration from Mecca to Medina in 622 CE", "ar": "هجرة النبي من مكة إلى المدينة عام 622 م", "fr": "La migration du Prophète de La Mecque à Médine en 622"}},
        {"word": "Badr", "hint": {"en": "First major battle of Islam, a decisive Muslim victory in 624 CE", "ar": "بدر — أول معركة كبرى في الإسلام، انتصار حاسم عام 624 م", "fr": "Première grande bataille de l'islam, victoire décisive des musulmans en 624"}},
        {"word": "Uhud", "hint": {"en": "Second major battle near Medina where Muslims faced setbacks", "ar": "أحد — ثاني معركة كبرى قرب المدينة حيث واجه المسلمون انتكاسة", "fr": "Deuxième grande bataille près de Médine où les musulmans subirent des revers"}},
        {"word": "Khandaq", "hint": {"en": "The Battle of the Trench — Muslims dug a defensive trench around Medina", "ar": "الخندق — حفر المسلمون خندقاً دفاعياً حول المدينة", "fr": "La bataille du Fossé — les musulmans creusèrent un fossé défensif autour de Médine"}},
        {"word": "Hudaybiyyah", "hint": {"en": "Peace treaty between Muslims and Quraysh that the Quran called a clear victory", "ar": "الحديبية — معاهدة سلام بين المسلمين وقريش وصفها القرآن بالفتح المبين", "fr": "Traité de paix entre les musulmans et Quraysh que le Coran qualifia de victoire éclatante"}},
        {"word": "Mecca", "hint": {"en": "The holiest city in Islam, birthplace of the Prophet and home of the Kaaba", "ar": "مكة المكرمة — أقدس مدينة في الإسلام، مسقط رأس النبي وموطن الكعبة", "fr": "La ville la plus sainte de l'islam, lieu de naissance du Prophète et de la Kaaba"}},
        {"word": "Medina", "hint": {"en": "The city of the Prophet, second holiest city in Islam", "ar": "المدينة المنورة — مدينة النبي، ثاني أقدس مدينة في الإسلام", "fr": "La ville du Prophète, deuxième ville la plus sainte de l'islam"}},
        {"word": "Abyssinia", "hint": {"en": "Land of the first Muslim migration, where the Negus gave them refuge", "ar": "الحبشة — أرض أول هجرة إسلامية حيث آواهم النجاشي", "fr": "Terre de la première migration musulmane, où le Négus leur donna refuge"}},
        {"word": "Taif", "hint": {"en": "City where the Prophet was rejected and stoned but forgave its people", "ar": "الطائف — المدينة التي رُفض فيها النبي ورُجم لكنه عفا عن أهلها", "fr": "Ville où le Prophète fut rejeté et lapidé mais pardonna à ses habitants"}},
        {"word": "Tabuk", "hint": {"en": "The last military expedition led by the Prophet in 630 CE", "ar": "تبوك — آخر غزوة قادها النبي عام 630 م", "fr": "La dernière expédition militaire menée par le Prophète en 630"}},
        {"word": "Khaybar", "hint": {"en": "Jewish fortress conquered by Muslims, known for Ali's bravery", "ar": "خيبر — حصن يهودي فتحه المسلمون، اشتهرت بشجاعة علي", "fr": "Forteresse juive conquise par les musulmans, connue pour la bravoure d'Ali"}},
        {"word": "Caliphate", "hint": {"en": "The Islamic system of governance after the Prophet's death", "ar": "الخلافة — نظام الحكم الإسلامي بعد وفاة النبي", "fr": "Le système de gouvernance islamique après la mort du Prophète"}},
        {"word": "Umayyad", "hint": {"en": "First hereditary Islamic dynasty, based in Damascus (661-750 CE)", "ar": "الأمويون — أول سلالة إسلامية وراثية، مقرها دمشق", "fr": "Première dynastie islamique héréditaire, basée à Damas (661-750)"}},
        {"word": "Abbasid", "hint": {"en": "Islamic dynasty known as the Golden Age of Islam, based in Baghdad", "ar": "العباسيون — السلالة المعروفة بالعصر الذهبي للإسلام، مقرها بغداد", "fr": "Dynastie islamique connue comme l'Âge d'or de l'islam, basée à Bagdad"}},
        {"word": "Ottoman", "hint": {"en": "Last major Islamic empire, ruled from Istanbul for over 600 years", "ar": "العثمانيون — آخر إمبراطورية إسلامية كبرى، حكمت من إسطنبول لأكثر من 600 عام", "fr": "Dernier grand empire islamique, gouvernant depuis Istanbul pendant plus de 600 ans"}},
        {"word": "Andalusia", "hint": {"en": "Muslim-ruled Iberian Peninsula, a beacon of learning and coexistence", "ar": "الأندلس — شبه الجزيرة الإيبيرية تحت الحكم الإسلامي، منارة للعلم والتعايش", "fr": "La péninsule ibérique sous domination musulmane, phare de savoir et de coexistence"}},
        {"word": "Baghdad", "hint": {"en": "Capital of the Abbasid Caliphate and center of the Islamic Golden Age", "ar": "بغداد — عاصمة الخلافة العباسية ومركز العصر الذهبي الإسلامي", "fr": "Capitale du califat abbasside et centre de l'Âge d'or islamique"}},
        {"word": "Damascus", "hint": {"en": "Capital of the Umayyad Caliphate, one of the oldest continuously inhabited cities", "ar": "دمشق — عاصمة الخلافة الأموية، من أقدم المدن المأهولة باستمرار", "fr": "Capitale du califat omeyyade, l'une des plus anciennes villes habitées en continu"}},
        {"word": "Cordoba", "hint": {"en": "Heart of Al-Andalus, famous for its Great Mosque and libraries", "ar": "قرطبة — قلب الأندلس، اشتهرت بمسجدها الكبير ومكتباتها", "fr": "Cœur d'Al-Andalus, célèbre pour sa Grande Mosquée et ses bibliothèques"}},
        {"word": "Jerusalem", "hint": {"en": "Al-Quds — third holiest city in Islam, site of Al-Aqsa Mosque", "ar": "القدس — ثالث أقدس مدينة في الإسلام، موقع المسجد الأقصى", "fr": "Al-Quds — troisième ville la plus sainte de l'islam, site de la mosquée Al-Aqsa"}},
    ],
    "Worship & Rituals": [
        {"word": "Salah", "hint": {"en": "The five daily ritual prayers, second pillar of Islam", "ar": "الصلوات الخمس اليومية، الركن الثاني من أركان الإسلام", "fr": "Les cinq prières rituelles quotidiennes, deuxième pilier de l'islam"}},
        {"word": "Zakat", "hint": {"en": "Obligatory charity, the third pillar of Islam", "ar": "الزكاة، الركن الثالث من أركان الإسلام", "fr": "L'aumône obligatoire, le troisième pilier de l'islam"}},
        {"word": "Sawm", "hint": {"en": "Fasting during Ramadan, the fourth pillar of Islam", "ar": "الصيام في رمضان، الركن الرابع من أركان الإسلام", "fr": "Le jeûne pendant le Ramadan, le quatrième pilier de l'islam"}},
        {"word": "Hajj", "hint": {"en": "The annual pilgrimage to Mecca, the fifth pillar of Islam", "ar": "الحج السنوي إلى مكة، الركن الخامس من أركان الإسلام", "fr": "Le pèlerinage annuel à La Mecque, le cinquième pilier de l'islam"}},
        {"word": "Shahada", "hint": {"en": "The declaration of faith, the first pillar of Islam", "ar": "الشهادة، الركن الأول من أركان الإسلام", "fr": "La déclaration de foi, le premier pilier de l'islam"}},
        {"word": "Wudu", "hint": {"en": "Ritual ablution with water before prayer", "ar": "الوضوء — الطهارة بالماء قبل الصلاة", "fr": "L'ablution rituelle avec de l'eau avant la prière"}},
        {"word": "Adhan", "hint": {"en": "The call to prayer announced five times daily", "ar": "الأذان — النداء للصلاة خمس مرات يومياً", "fr": "L'appel à la prière annoncé cinq fois par jour"}},
        {"word": "Iqamah", "hint": {"en": "The second call just before congregational prayer starts", "ar": "الإقامة — النداء الثاني قبل بدء صلاة الجماعة", "fr": "Le second appel juste avant le début de la prière en congrégation"}},
        {"word": "Qiyam", "hint": {"en": "Standing position in prayer, also refers to night prayer", "ar": "القيام — وضعية الوقوف في الصلاة، يشير أيضاً لصلاة الليل", "fr": "La position debout dans la prière, désigne aussi la prière nocturne"}},
        {"word": "Sujud", "hint": {"en": "Prostration — placing the forehead on the ground in prayer", "ar": "السجود — وضع الجبهة على الأرض في الصلاة", "fr": "La prosternation — poser le front au sol dans la prière"}},
        {"word": "Ruku", "hint": {"en": "Bowing position in prayer with hands on knees", "ar": "الركوع — الانحناء في الصلاة مع وضع اليدين على الركبتين", "fr": "La position inclinée dans la prière avec les mains sur les genoux"}},
        {"word": "Tashahhud", "hint": {"en": "The testimony recited while sitting in prayer", "ar": "التشهد — الشهادة التي تُقرأ أثناء الجلوس في الصلاة", "fr": "Le témoignage récité en position assise dans la prière"}},
        {"word": "Tasleem", "hint": {"en": "The greeting of peace that concludes the prayer", "ar": "التسليم — تحية السلام التي تختتم الصلاة", "fr": "La salutation de paix qui conclut la prière"}},
        {"word": "Takbir", "hint": {"en": "Saying 'Allahu Akbar' — God is the Greatest", "ar": "التكبير — قول 'الله أكبر'", "fr": "Dire 'Allahu Akbar' — Dieu est le Plus Grand"}},
        {"word": "Tahmid", "hint": {"en": "Saying 'Alhamdulillah' — Praise be to God", "ar": "التحميد — قول 'الحمد لله'", "fr": "Dire 'Alhamdulillah' — Louange à Dieu"}},
        {"word": "Tasbih", "hint": {"en": "Glorification of God by saying 'SubhanAllah'", "ar": "التسبيح — تمجيد الله بقول 'سبحان الله'", "fr": "La glorification de Dieu en disant 'SubhanAllah'"}},
        {"word": "Istighfar", "hint": {"en": "Seeking forgiveness from God by saying 'Astaghfirullah'", "ar": "الاستغفار — طلب المغفرة من الله بقول 'أستغفر الله'", "fr": "Demander pardon à Dieu en disant 'Astaghfirullah'"}},
        {"word": "Tawaf", "hint": {"en": "Circling the Kaaba seven times during Hajj or Umrah", "ar": "الطواف — الدوران حول الكعبة سبع مرات في الحج أو العمرة", "fr": "Faire sept tours autour de la Kaaba pendant le Hajj ou la Omra"}},
        {"word": "Sai", "hint": {"en": "Walking seven times between the hills of Safa and Marwa", "ar": "السعي — المشي سبع مرات بين الصفا والمروة", "fr": "Marcher sept fois entre les collines de Safa et Marwa"}},
        {"word": "Ihram", "hint": {"en": "The sacred state and white garments worn during Hajj or Umrah", "ar": "الإحرام — الحالة المقدسة واللباس الأبيض في الحج أو العمرة", "fr": "L'état sacré et les vêtements blancs portés pendant le Hajj ou la Omra"}},
    ],
    "Islamic Values": [
        {"word": "Tawakkul", "hint": {"en": "Complete trust and reliance in God's plan", "ar": "التوكل — الاعتماد الكامل على الله والثقة بتدبيره", "fr": "La confiance totale en le plan de Dieu"}},
        {"word": "Sabr", "hint": {"en": "Patience and perseverance through hardship", "ar": "الصبر — التحمل والمثابرة في مواجهة الشدائد", "fr": "La patience et la persévérance face aux épreuves"}},
        {"word": "Shukr", "hint": {"en": "Gratitude to Allah for His blessings", "ar": "الشكر — الامتنان لله على نعمه", "fr": "La gratitude envers Allah pour Ses bienfaits"}},
        {"word": "Taqwa", "hint": {"en": "God-consciousness and piety in all aspects of life", "ar": "التقوى — الوعي بالله والورع في جميع جوانب الحياة", "fr": "La conscience de Dieu et la piété dans tous les aspects de la vie"}},
        {"word": "Ihsan", "hint": {"en": "Excellence in worship — to worship God as if you see Him", "ar": "الإحسان — أن تعبد الله كأنك تراه", "fr": "L'excellence dans l'adoration — adorer Dieu comme si tu Le voyais"}},
        {"word": "Iman", "hint": {"en": "Faith — belief in God, angels, books, prophets, Last Day, and decree", "ar": "الإيمان — التصديق بالله وملائكته وكتبه ورسله واليوم الآخر والقدر", "fr": "La foi — croyance en Dieu, Ses anges, Ses livres, Ses prophètes, le Jour dernier et le destin"}},
        {"word": "Adl", "hint": {"en": "Justice and fairness, a fundamental principle in Islam", "ar": "العدل — العدالة والإنصاف، مبدأ أساسي في الإسلام", "fr": "La justice et l'équité, un principe fondamental en islam"}},
        {"word": "Rahma", "hint": {"en": "Mercy and compassion, a core attribute of Allah", "ar": "الرحمة — صفة أساسية من صفات الله", "fr": "La miséricorde et la compassion, un attribut fondamental d'Allah"}},
        {"word": "Hikmah", "hint": {"en": "Wisdom — the ability to apply knowledge with insight and judgment", "ar": "الحكمة — القدرة على تطبيق المعرفة بتبصر وحسن تقدير", "fr": "La sagesse — la capacité d'appliquer la connaissance avec discernement"}},
        {"word": "Ilm", "hint": {"en": "Knowledge — seeking it is an obligation upon every Muslim", "ar": "العلم — طلبه فريضة على كل مسلم", "fr": "La connaissance — la rechercher est une obligation pour tout musulman"}},
        {"word": "Amanah", "hint": {"en": "Trustworthiness and fulfilling responsibilities entrusted to you", "ar": "الأمانة — الثقة والوفاء بالمسؤوليات الموكلة إليك", "fr": "La fiabilité et l'accomplissement des responsabilités qui vous sont confiées"}},
        {"word": "Sidq", "hint": {"en": "Truthfulness and sincerity in speech and action", "ar": "الصدق — الحقيقة والإخلاص في القول والفعل", "fr": "La véracité et la sincérité en parole et en acte"}},
        {"word": "Haya", "hint": {"en": "Modesty and shyness — a branch of faith", "ar": "الحياء — شعبة من شعب الإيمان", "fr": "La pudeur et la modestie — une branche de la foi"}},
        {"word": "Tawbah", "hint": {"en": "Repentance — turning back to God after sin", "ar": "التوبة — الرجوع إلى الله بعد الذنب", "fr": "Le repentir — revenir à Dieu après le péché"}},
        {"word": "Ikhlas", "hint": {"en": "Sincerity — doing deeds purely for the sake of Allah", "ar": "الإخلاص — العمل خالصاً لوجه الله", "fr": "La sincérité — accomplir les actes uniquement pour l'amour d'Allah"}},
        {"word": "Birr", "hint": {"en": "Righteousness and goodness in all dealings", "ar": "البر — الصلاح والإحسان في جميع المعاملات", "fr": "La droiture et la bonté dans toutes les relations"}},
        {"word": "Husn", "hint": {"en": "Beauty and goodness, especially in character and conduct", "ar": "الحُسن — الجمال والطيب، خاصة في الأخلاق والسلوك", "fr": "La beauté et la bonté, surtout dans le caractère et la conduite"}},
        {"word": "Khushu", "hint": {"en": "Deep humility and focus in prayer and worship", "ar": "الخشوع — التواضع العميق والتركيز في الصلاة والعبادة", "fr": "L'humilité profonde et la concentration dans la prière et l'adoration"}},
        {"word": "Wara", "hint": {"en": "Scrupulousness — avoiding anything doubtful or suspicious", "ar": "الورع — تجنب كل ما هو مشبوه أو مشكوك فيه", "fr": "Le scrupule — éviter tout ce qui est douteux ou suspect"}},
        {"word": "Zuhd", "hint": {"en": "Asceticism — detachment from worldly pleasures for God's sake", "ar": "الزهد — الإعراض عن متع الدنيا في سبيل الله", "fr": "L'ascétisme — le détachement des plaisirs mondains pour l'amour de Dieu"}},
    ],
    "Islamic Sciences": [
        {"word": "Fiqh", "hint": {"en": "Islamic jurisprudence — understanding of religious laws and rulings", "ar": "الفقه — فهم الأحكام والتشريعات الدينية", "fr": "La jurisprudence islamique — compréhension des lois et jugements religieux"}},
        {"word": "Hadith", "hint": {"en": "The study of prophetic traditions and their chains of narration", "ar": "علم الحديث — دراسة الأحاديث النبوية وأسانيدها", "fr": "L'étude des traditions prophétiques et de leurs chaînes de narration"}},
        {"word": "Tafsir", "hint": {"en": "The science of Quranic interpretation and commentary", "ar": "علم التفسير — شرح وتأويل القرآن الكريم", "fr": "La science de l'interprétation et du commentaire coranique"}},
        {"word": "Aqeedah", "hint": {"en": "Islamic creed and theology — the study of core beliefs", "ar": "العقيدة — دراسة أصول الإيمان والمعتقدات", "fr": "Le credo et la théologie islamique — l'étude des croyances fondamentales"}},
        {"word": "Usul", "hint": {"en": "Principles of Islamic jurisprudence — methodology for deriving rulings", "ar": "أصول الفقه — منهجية استنباط الأحكام الشرعية", "fr": "Les principes de la jurisprudence islamique — méthodologie d'extraction des jugements"}},
        {"word": "Seerah", "hint": {"en": "The biographical study of Prophet Muhammad's life", "ar": "السيرة النبوية — دراسة حياة النبي محمد", "fr": "L'étude biographique de la vie du Prophète Muhammad"}},
        {"word": "Tajweed", "hint": {"en": "The science of correct Quran recitation and pronunciation", "ar": "علم التجويد — قواعد التلاوة الصحيحة للقرآن", "fr": "La science de la récitation et de la prononciation correctes du Coran"}},
        {"word": "Nahw", "hint": {"en": "Arabic grammar — essential for understanding the Quran", "ar": "النحو — القواعد العربية الضرورية لفهم القرآن", "fr": "La grammaire arabe — essentielle pour comprendre le Coran"}},
        {"word": "Sarf", "hint": {"en": "Arabic morphology — the study of word forms and patterns", "ar": "الصرف — دراسة أوزان الكلمات وأبنيتها", "fr": "La morphologie arabe — l'étude des formes et structures des mots"}},
        {"word": "Balagha", "hint": {"en": "Arabic rhetoric and eloquence, key to Quranic literary analysis", "ar": "البلاغة — علم الفصاحة العربية، مفتاح التحليل الأدبي للقرآن", "fr": "La rhétorique et l'éloquence arabes, clé de l'analyse littéraire coranique"}},
        {"word": "Mantiq", "hint": {"en": "Islamic logic — the science of correct reasoning", "ar": "المنطق — علم التفكير الصحيح", "fr": "La logique islamique — la science du raisonnement correct"}},
        {"word": "Falsafa", "hint": {"en": "Islamic philosophy — synthesis of Greek philosophy with Islamic thought", "ar": "الفلسفة الإسلامية — دمج الفلسفة اليونانية مع الفكر الإسلامي", "fr": "La philosophie islamique — synthèse de la philosophie grecque et de la pensée islamique"}},
        {"word": "Kalam", "hint": {"en": "Islamic theology — rational discourse about God's attributes and nature", "ar": "علم الكلام — الخطاب العقلاني حول صفات الله وطبيعته", "fr": "La théologie islamique — discours rationnel sur les attributs et la nature de Dieu"}},
        {"word": "Tasawwuf", "hint": {"en": "Islamic spirituality and mysticism — the inner dimension of worship", "ar": "التصوف — الروحانية الإسلامية والبعد الباطني للعبادة", "fr": "La spiritualité et le mysticisme islamiques — la dimension intérieure de l'adoration"}},
        {"word": "Ijtihad", "hint": {"en": "Independent scholarly reasoning to derive new legal rulings", "ar": "الاجتهاد — التفكير العلمي المستقل لاستنباط أحكام شرعية جديدة", "fr": "Le raisonnement savant indépendant pour dériver de nouveaux jugements juridiques"}},
    ],
}


async def seed_codenames_words(session: AsyncSession) -> None:
    """Seed Codenames word packs and words.

    Args:
        session: The database session.
    """
    total_words = 0
    new_packs = 0

    for pack_name, words in CODENAMES_WORD_PACKS.items():
        existing_pack = (
            await session.exec(select(CodenamesWordPack).where(CodenamesWordPack.name == pack_name))
        ).first()
        if existing_pack:
            pack = existing_pack
        else:
            pack = CodenamesWordPack(
                id=uuid4(),
                name=pack_name,
                description=f"Islamic terms related to {pack_name.lower()}",
                is_active=True,
            )
            session.add(pack)
            await session.flush()
            new_packs += 1

        for word_data in words:
            existing_word = (
                await session.exec(
                    select(CodenamesWord).where(
                        CodenamesWord.word == word_data["word"],
                        CodenamesWord.word_pack_id == pack.id,
                    )
                )
            ).first()
            if existing_word:
                continue
            word = CodenamesWord(
                id=uuid4(),
                word=word_data["word"],
                hint=word_data.get("hint"),
                word_pack_id=pack.id,
            )
            session.add(word)
            total_words += 1

    await session.commit()
    print(f"  Seeded {new_packs} new Codenames packs, {total_words} new words")
