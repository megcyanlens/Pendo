(function () {
  if (!pendo.designerEnabled) {

  // Centralized ids — every id below is specific to this step's own DOM.
  // These are all stable *block-level* ids (confirmed unchanged across
  // several re-renders) — as opposed to the leaf ids inside rich-text
  // content like the NEXT UP paragraph's bold/span pair, which Pendo
  // regenerates fresh on every render, so those are looked up relatively
  // instead of by id (see updateNextUp below).
  const LIST_ID = 'pendo-list-e0407f46';
  const PROGRESS_FILL_ID = 'pendo-progress-bar-fill-e7a5fcf7';
  const PROGRESS_TEXT_ID = 'pendo-text-6baee323';
  const NEXT_UP_LABEL_ID = 'pendo-text-113f6bd1';
  const NEXT_UP_TEXT_ID = 'pendo-text-44772b1d';
  const NEXT_UP_ROW_ID = 'pendo-row-df33028b';
  const DURATION_TEXT_ID = 'pendo-text-654f055c';
  const WATCH_NOW_BUTTON_ID = 'pendo-button-971f7bf5';
  const GUIDE_CONTAINER_ID = 'pendo-guide-container-WKhm-v1XKs6Uv_f3qujXNq-K_So';
  // Pasted directly into a code block from minimizedVersion.html.
  const ADD_ON_CHOOSER_ID = 'addOnChooser';

  const WELCOME_VIDEO_GUIDE_ID = '5ZS3fuPEsKYHuc21OxjI_BzWty8';
  const QLIK_EXPERIENCE_GUIDE_ID = 'Xee4zKS25f0Lr3qUIPlWNKQPGSA'; // "The Qlik Experience" — there is only one guide for this module
  const LEARN_LEVEL_UP_GUIDE_ID = 'FFt80UenJSRW0Cq4OFccXXE7tXg';
  const CONNECT_VISUALIZE_GUIDE_ID = 'Tb4go-ygfnaCTyHmETJHG7Kjlng';
  const SHARE_GUIDE_ID = 'N3OfqlLRdFoQeKiihDm6tsN7fi0';
  const CURATE_CUSTOMIZE_GUIDE_ID = '71o_-o9o6PQTvyulcbtlF3bFZxw';

  // Add-on guides, keyed by their addOnChooser cell class: segmentedGuideId
  // is the segment-eligibility check (the visitor is eligible once that
  // guide exists for them), launchGuideId is what clicking the cell opens.
  const addOnGuideMap = {
    opt1: { segmentedGuideId: 'nuujFMauc8MWfTXgD81yyVPORIk', launchGuideId: '9kNzPPHZtTmnd99fqLXB4fHRznw' }, // ai & nlg
    opt2: { segmentedGuideId: 'C2GOumslcEt_jWoSzQV33ouPREY', launchGuideId: '0zUf-u9Vt4sWKIsbillGl5yZBYU' }, // analytics scripting
    opt3: { segmentedGuideId: '-L-6T2h8QyAZT_L1ZlMONRHA25o', launchGuideId: 'lXLU_WzuitYjM_GX_NJhK1oFsDQ' }, // optimization automation
    opt4: { segmentedGuideId: '58swkW1IoseSYF_Sugzhl0wRl8Q', launchGuideId: 'rG6ykdoAfUu2AfRG_Zku-R1YKbg' }, // data science predictions
    opt5: { segmentedGuideId: '3mTghDOhQLjVHjB32mukv1c7kyA', launchGuideId: 'gS-kTJ43ek2Zmuk7JDqA0n5reZM' }, // alerts monitoring
    opt6: { segmentedGuideId: 'KWEQGwLn5EN4DcsYODcCFS_wXlU', launchGuideId: '89ZceHHEtHdokfiH-lQClp7o5c8' }, // complex reporting
    opt7: { segmentedGuideId: 'uMB0zKTvIifWVxXlnsxPQpQ1fyU', launchGuideId: 'xcwEOrnbdvcQlir0ZX-7TIfcmZA' }  // integration apis
  };

  // Minutes shown per module; Learn & Level-up has none (null). Kept
  // separate from the translated copy below since a number doesn't need
  // translating — only the "Duration: ~N minutes" wording around it does.
  const STEP_MINUTES = {
    [WELCOME_VIDEO_GUIDE_ID]: 3,
    [QLIK_EXPERIENCE_GUIDE_ID]: 8,
    [CONNECT_VISUALIZE_GUIDE_ID]: 12,
    [SHARE_GUIDE_ID]: 7,
    [CURATE_CUSTOMIZE_GUIDE_ID]: 6,
    [LEARN_LEVEL_UP_GUIDE_ID]: null
  };

  // Step *labels* (e.g. "Welcome Video") are intentionally NOT translated
  // here — they're read straight off each list item's own title text (see
  // getStepLabel below), which Pendo already translates as authored guide
  // content through its own localization pipeline. Only text this script
  // itself injects — the NEXT UP description, the duration line, and the
  // action button's label — needs its own translation table, since none of
  // that exists as authored Pendo content anywhere in this step.
  //
  // Locale is read once from pendo.getSerializedMetadata().visitor.locale
  // and matched against this list; unmatched/unknown locales fall back to
  // English. zh needs region-level disambiguation (CN vs TW) since a bare
  // "zh" can't tell simplified from traditional.
  const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'nl', 'fr', 'de', 'en', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'es', 'sv', 'tr'];

  const TRANSLATIONS = {
    en: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Get a quick overview of everything your Qlik Cloud trial has to offer, including platform structure and key features.',
        [QLIK_EXPERIENCE_GUIDE_ID]: "Step into a fully loaded analytics environment and work through a real business problem using Qlik's associative engine — every answer grounded in trusted, governed sources.",
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Connect your own data source, load it into an analytics app, and start analyzing right away — the full creator workflow, powered by your actual data.',
        [SHARE_GUIDE_ID]: 'Publish your app to a shared space and invite a colleague to your tenant, setting up permissions and access so your insights can make an impact beyond just you.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Shape how your team experiences Qlik by building collections, configuring the Insights activity center, and creating a custom home page for your tenant.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Take a short survey to identify the learning paths most relevant to your role and goals — your personalized recommendations will be added directly to your journey, shown below.'
      },
      durationTemplate: 'Duration: ~{n} minutes',
      buttons: { watchNow: 'Watch now →', takeSurvey: 'Take survey →', startModule: 'Start module →', refresh: 'Refresh ⟳', refreshing: 'Refreshing…' },
      hydrationLoading: 'The resources are still being loaded. Please check back in a few minutes!'
    },
    fr: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Obtenez un aperçu rapide de tout ce que votre essai Qlik Cloud a à offrir, notamment la structure de la plateforme et ses fonctionnalités clés.',
        [QLIK_EXPERIENCE_GUIDE_ID]: "Plongez dans un environnement analytique complet et résolvez un cas métier réel grâce au moteur associatif de Qlik — chaque réponse s'appuie sur des sources fiables et gouvernées.",
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Connectez votre propre source de données, chargez-la dans une application analytique et commencez à analyser immédiatement — le flux de travail complet du créateur, alimenté par vos données réelles.',
        [SHARE_GUIDE_ID]: 'Publiez votre application dans un espace partagé et invitez un collègue dans votre tenant, en configurant les autorisations et les accès pour que vos analyses aient un impact au-delà de vous seul.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: "Façonnez l'expérience Qlik de votre équipe en créant des collections, en configurant le centre d'activité Insights et en créant une page d'accueil personnalisée pour votre tenant.",
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Répondez à un court questionnaire pour identifier les parcours de formation les plus pertinents pour votre rôle et vos objectifs — vos recommandations personnalisées seront ajoutées directement à votre parcours, ci-dessous.'
      },
      durationTemplate: 'Durée : ~{n} minutes',
      buttons: { watchNow: 'Regarder maintenant →', takeSurvey: 'Répondre au questionnaire →', startModule: 'Démarrer le module →', refresh: 'Actualiser ⟳', refreshing: 'Actualisation…' },
      hydrationLoading: 'Les ressources sont en cours de chargement. Merci de revenir dans quelques minutes !'
    },
    de: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Verschaffen Sie sich einen schnellen Überblick über alles, was Ihre Qlik Cloud-Testversion zu bieten hat, einschließlich Plattformstruktur und wichtiger Funktionen.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Tauchen Sie in eine voll ausgestattete Analyseumgebung ein und lösen Sie ein reales Geschäftsproblem mit der assoziativen Engine von Qlik – jede Antwort basiert auf vertrauenswürdigen, verwalteten Quellen.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Verbinden Sie Ihre eigene Datenquelle, laden Sie sie in eine Analyse-App und beginnen Sie sofort mit der Analyse – der vollständige Creator-Workflow, angetrieben von Ihren echten Daten.',
        [SHARE_GUIDE_ID]: 'Veröffentlichen Sie Ihre App in einem gemeinsamen Bereich und laden Sie einen Kollegen zu Ihrem Tenant ein, indem Sie Berechtigungen und Zugriff einrichten, damit Ihre Erkenntnisse über Sie hinaus wirken können.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Gestalten Sie die Qlik-Erfahrung Ihres Teams, indem Sie Sammlungen erstellen, das Insights-Aktivitätscenter konfigurieren und eine individuelle Startseite für Ihren Tenant erstellen.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Nehmen Sie an einer kurzen Umfrage teil, um die für Ihre Rolle und Ziele relevantesten Lernpfade zu ermitteln – Ihre persönlichen Empfehlungen werden direkt zu Ihrer Journey hinzugefügt, wie unten gezeigt.'
      },
      durationTemplate: 'Dauer: ~{n} Minuten',
      buttons: { watchNow: 'Jetzt ansehen →', takeSurvey: 'Umfrage starten →', startModule: 'Modul starten →', refresh: 'Aktualisieren ⟳', refreshing: 'Wird aktualisiert…' },
      hydrationLoading: 'Die Ressourcen werden noch geladen. Bitte schauen Sie in ein paar Minuten wieder vorbei!'
    },
    es: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Obtenga un resumen rápido de todo lo que ofrece su prueba de Qlik Cloud, incluida la estructura de la plataforma y las funciones clave.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Sumérjase en un entorno analítico completo y resuelva un problema empresarial real con el motor asociativo de Qlik: cada respuesta se basa en fuentes fiables y gobernadas.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Conecte su propia fuente de datos, cárguela en una aplicación de análisis y empiece a analizar de inmediato: el flujo de trabajo completo de creador, impulsado por sus datos reales.',
        [SHARE_GUIDE_ID]: 'Publique su aplicación en un espacio compartido e invite a un colega a su tenant, configurando los permisos y el acceso para que sus datos generen impacto más allá de usted.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Dé forma a la experiencia Qlik de su equipo creando colecciones, configurando el centro de actividad de Insights y creando una página de inicio personalizada para su tenant.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Responda una breve encuesta para identificar las rutas de aprendizaje más relevantes para su función y objetivos: sus recomendaciones personalizadas se añadirán directamente a su recorrido, que se muestra a continuación.'
      },
      durationTemplate: 'Duración: ~{n} minutos',
      buttons: { watchNow: 'Ver ahora →', takeSurvey: 'Responder encuesta →', startModule: 'Iniciar módulo →', refresh: 'Actualizar ⟳', refreshing: 'Actualizando…' },
      hydrationLoading: 'Los recursos aún se están cargando. ¡Vuelva a comprobarlo en unos minutos!'
    },
    it: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Ottieni una rapida panoramica di tutto ciò che la tua prova di Qlik Cloud ha da offrire, inclusa la struttura della piattaforma e le funzionalità principali.',
        [QLIK_EXPERIENCE_GUIDE_ID]: "Immergiti in un ambiente analitico completo e risolvi un caso aziendale reale utilizzando il motore associativo di Qlik, con ogni risposta basata su fonti affidabili e governate.",
        [CONNECT_VISUALIZE_GUIDE_ID]: "Collega la tua fonte di dati, caricala in un'app di analisi e inizia subito ad analizzare: il flusso di lavoro completo del creator, basato sui tuoi dati reali.",
        [SHARE_GUIDE_ID]: "Pubblica la tua app in uno spazio condiviso e invita un collega nel tuo tenant, configurando permessi e accessi affinché le tue analisi abbiano un impatto che vada oltre te stesso.",
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Definisci come il tuo team vive l\'esperienza Qlik creando raccolte, configurando il centro attività Insights e creando una home page personalizzata per il tuo tenant.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Rispondi a un breve sondaggio per individuare i percorsi di apprendimento più rilevanti per il tuo ruolo e i tuoi obiettivi: i tuoi consigli personalizzati verranno aggiunti direttamente al tuo percorso, mostrato di seguito.'
      },
      durationTemplate: 'Durata: ~{n} minuti',
      buttons: { watchNow: 'Guarda ora →', takeSurvey: 'Rispondi al sondaggio →', startModule: 'Avvia modulo →', refresh: 'Aggiorna ⟳', refreshing: 'Aggiornamento…' },
      hydrationLoading: 'Le risorse sono ancora in fase di caricamento. Ricontrolla tra qualche minuto!'
    },
    nl: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Krijg snel een overzicht van alles wat uw Qlik Cloud-proefversie te bieden heeft, inclusief platformstructuur en belangrijke functies.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Stap in een volledig uitgeruste analyseomgeving en werk een echt bedrijfsvraagstuk uit met de associatieve engine van Qlik — elk antwoord is gebaseerd op betrouwbare, beheerde bronnen.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Verbind uw eigen gegevensbron, laad deze in een analyse-app en begin direct met analyseren — de volledige creator-workflow, aangedreven door uw eigen data.',
        [SHARE_GUIDE_ID]: 'Publiceer uw app naar een gedeelde ruimte en nodig een collega uit voor uw tenant, waarbij u rechten en toegang instelt zodat uw inzichten verder reiken dan alleen u.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Bepaal hoe uw team Qlik ervaart door collecties te bouwen, het Insights-activiteitencentrum te configureren en een aangepaste startpagina voor uw tenant te maken.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Doe een korte enquête om de leertrajecten te bepalen die het beste bij uw rol en doelen passen — uw persoonlijke aanbevelingen worden direct aan uw traject toegevoegd, hieronder weergegeven.'
      },
      durationTemplate: 'Duur: ~{n} minuten',
      buttons: { watchNow: 'Nu bekijken →', takeSurvey: 'Enquête starten →', startModule: 'Module starten →', refresh: 'Vernieuwen ⟳', refreshing: 'Vernieuwen…' },
      hydrationLoading: 'De resources worden nog geladen. Kijk over een paar minuten nog eens!'
    },
    sv: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Få en snabb överblick över allt din Qlik Cloud-provperiod har att erbjuda, inklusive plattformens struktur och viktiga funktioner.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Kliv in i en fullt utrustad analysmiljö och arbeta igenom ett verkligt affärsproblem med Qliks associativa motor — varje svar bygger på pålitliga, styrda källor.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Anslut din egen datakälla, ladda den i en analysapp och börja analysera direkt — hela creator-arbetsflödet, drivet av din egen data.',
        [SHARE_GUIDE_ID]: 'Publicera din app till ett delat utrymme och bjud in en kollega till din tenant genom att konfigurera behörigheter och åtkomst, så att dina insikter kan göra skillnad för fler än bara dig.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Forma hur ditt team upplever Qlik genom att bygga samlingar, konfigurera Insights-aktivitetscentret och skapa en anpassad startsida för din tenant.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Svara på en kort enkät för att hitta de utbildningsvägar som är mest relevanta för din roll och dina mål — dina personliga rekommendationer läggs till direkt i din resa, som visas nedan.'
      },
      durationTemplate: 'Tid: ~{n} minuter',
      buttons: { watchNow: 'Titta nu →', takeSurvey: 'Svara på enkäten →', startModule: 'Starta modul →', refresh: 'Uppdatera ⟳', refreshing: 'Uppdaterar…' },
      hydrationLoading: 'Resurserna laddas fortfarande. Kolla igen om några minuter!'
    },
    pl: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Zdobądź szybki przegląd wszystkiego, co oferuje Twoja wersja próbna Qlik Cloud, w tym struktury platformy i kluczowych funkcji.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Wejdź do w pełni funkcjonalnego środowiska analitycznego i rozwiąż prawdziwy problem biznesowy za pomocą silnika asocjacyjnego Qlik — każda odpowiedź oparta jest na wiarygodnych, zarządzanych źródłach.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Połącz własne źródło danych, wczytaj je do aplikacji analitycznej i zacznij analizować od razu — pełny przepływ pracy twórcy, zasilany Twoimi rzeczywistymi danymi.',
        [SHARE_GUIDE_ID]: 'Opublikuj swoją aplikację w udostępnionej przestrzeni i zaproś współpracownika do swojego tenanta, konfigurując uprawnienia i dostęp, aby Twoje analizy miały wpływ wykraczający poza Ciebie samego.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Zdecyduj, jak Twój zespół korzysta z Qlik, tworząc kolekcje, konfigurując centrum aktywności Insights i tworząc niestandardową stronę główną dla swojego tenanta.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Wypełnij krótką ankietę, aby określić ścieżki nauki najbardziej odpowiednie dla Twojej roli i celów — Twoje spersonalizowane rekomendacje zostaną dodane bezpośrednio do Twojej podróży, widocznej poniżej.'
      },
      durationTemplate: 'Czas trwania: ~{n} minut',
      buttons: { watchNow: 'Obejrzyj teraz →', takeSurvey: 'Wypełnij ankietę →', startModule: 'Rozpocznij moduł →', refresh: 'Odśwież ⟳', refreshing: 'Odświeżanie…' },
      hydrationLoading: 'Zasoby wciąż się wczytują. Sprawdź ponownie za kilka minut!'
    },
    pt: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Obtenha uma visão geral rápida de tudo o que o seu teste do Qlik Cloud tem a oferecer, incluindo a estrutura da plataforma e os principais recursos.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Entre em um ambiente analítico completo e resolva um problema de negócios real usando o mecanismo associativo da Qlik — cada resposta baseada em fontes confiáveis e governadas.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Conecte sua própria fonte de dados, carregue-a em um aplicativo de análise e comece a analisar imediatamente — o fluxo de trabalho completo do criador, alimentado pelos seus dados reais.',
        [SHARE_GUIDE_ID]: 'Publique seu aplicativo em um espaço compartilhado e convide um colega para o seu tenant, configurando permissões e acesso para que seus insights gerem impacto além de você.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Molde como sua equipe vive a experiência Qlik, criando coleções, configurando o centro de atividades Insights e criando uma página inicial personalizada para o seu tenant.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Responda a uma breve pesquisa para identificar as trilhas de aprendizagem mais relevantes para sua função e objetivos — suas recomendações personalizadas serão adicionadas diretamente à sua jornada, exibida abaixo.'
      },
      durationTemplate: 'Duração: ~{n} minutos',
      buttons: { watchNow: 'Assistir agora →', takeSurvey: 'Responder pesquisa →', startModule: 'Iniciar módulo →', refresh: 'Atualizar ⟳', refreshing: 'Atualizando…' },
      hydrationLoading: 'Os recursos ainda estão sendo carregados. Volte a verificar em alguns minutos!'
    },
    ru: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Быстро узнайте обо всех возможностях вашей пробной версии Qlik Cloud, включая структуру платформы и ключевые функции.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Погрузитесь в полнофункциональную аналитическую среду и решите реальную бизнес-задачу с помощью ассоциативного механизма Qlik — каждый ответ основан на надёжных, управляемых источниках.',
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Подключите собственный источник данных, загрузите его в аналитическое приложение и сразу начните анализ — полный рабочий процесс создателя на основе ваших реальных данных.',
        [SHARE_GUIDE_ID]: 'Опубликуйте своё приложение в общем пространстве и пригласите коллегу в свой тенант, настроив права доступа, чтобы ваши данные приносили пользу не только вам.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Определите, каким образом ваша команда взаимодействует с Qlik: создавайте коллекции, настраивайте центр активности Insights и создайте персональную домашнюю страницу для своего тенанта.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Пройдите короткий опрос, чтобы определить учебные пути, наиболее подходящие для вашей роли и целей — персональные рекомендации будут добавлены прямо в ваш маршрут, показанный ниже.'
      },
      durationTemplate: 'Длительность: ~{n} мин.',
      buttons: { watchNow: 'Смотреть →', takeSurvey: 'Пройти опрос →', startModule: 'Начать модуль →', refresh: 'Обновить ⟳', refreshing: 'Обновление…' },
      hydrationLoading: 'Ресурсы ещё загружаются. Пожалуйста, проверьте снова через несколько минут!'
    },
    tr: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'Qlik Cloud deneme sürümünüzün sunduğu her şeye — platform yapısı ve temel özellikler dahil — hızlıca göz atın.',
        [QLIK_EXPERIENCE_GUIDE_ID]: "Qlik'in ilişkisel motorunu kullanarak gerçek bir iş problemini çözmek için eksiksiz donatılmış bir analiz ortamına adım atın — her yanıt güvenilir, yönetilen kaynaklara dayanır.",
        [CONNECT_VISUALIZE_GUIDE_ID]: 'Kendi veri kaynağınızı bağlayın, bir analiz uygulamasına yükleyin ve hemen analiz etmeye başlayın — gerçek verilerinizle çalışan eksiksiz oluşturucu iş akışı.',
        [SHARE_GUIDE_ID]: 'Uygulamanızı paylaşılan bir alanda yayınlayın ve izinler ile erişimi ayarlayarak bir meslektaşınızı kiracınıza davet edin, böylece analizleriniz sizin dışınızda da etki oluşturabilsin.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'Koleksiyonlar oluşturarak, Insights etkinlik merkezini yapılandırarak ve kiracınız için özel bir ana sayfa oluşturarak ekibinizin Qlik deneyimini şekillendirin.',
        [LEARN_LEVEL_UP_GUIDE_ID]: 'Rolünüz ve hedefleriniz için en uygun öğrenme yollarını belirlemek için kısa bir ankete katılın — kişiselleştirilmiş önerileriniz doğrudan aşağıda gösterilen yolculuğunuza eklenecektir.'
      },
      durationTemplate: 'Süre: ~{n} dakika',
      buttons: { watchNow: 'Şimdi izle →', takeSurvey: 'Anketi yanıtla →', startModule: 'Modülü başlat →', refresh: 'Yenile ⟳', refreshing: 'Yenileniyor…' },
      hydrationLoading: 'Kaynaklar hâlâ yükleniyor. Lütfen birkaç dakika sonra tekrar kontrol edin!'
    },
    ja: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: 'プラットフォームの構成や主な機能など、Qlik Cloud トライアルで利用できる内容をすばやく確認できます。',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Qlik のアソシエイティブエンジンを使って実際のビジネス課題に取り組み、信頼できる管理されたソースに基づいた回答が得られる、フル機能の分析環境をお試しください。',
        [CONNECT_VISUALIZE_GUIDE_ID]: '独自のデータソースを接続し、分析アプリに読み込んで、すぐに分析を開始できます。実際のデータを活用した、フルクリエイターワークフローです。',
        [SHARE_GUIDE_ID]: 'アプリを共有スペースに公開し、権限とアクセスを設定して同僚をテナントに招待することで、あなたの分析結果がより多くの人に活用されます。',
        [CURATE_CUSTOMIZE_GUIDE_ID]: 'コレクションの作成、Insights アクティビティセンターの設定、テナント専用のカスタムホームページの作成など、チームの Qlik 体験をカスタマイズできます。',
        [LEARN_LEVEL_UP_GUIDE_ID]: '短いアンケートに回答して、あなたの役割や目標に最も関連する学習パスを特定してください。パーソナライズされたおすすめは、以下に表示されるジャーニーに直接追加されます。'
      },
      durationTemplate: '所要時間: ~{n} 分',
      buttons: { watchNow: '今すぐ視聴 →', takeSurvey: 'アンケートに回答 →', startModule: 'モジュールを開始 →', refresh: '再読み込み ⟳', refreshing: '再読み込み中…' },
      hydrationLoading: 'リソースはまだ読み込み中です。数分後に再度確認してください。'
    },
    ko: {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: '플랫폼 구조와 주요 기능을 포함하여 Qlik Cloud 체험판이 제공하는 모든 것을 빠르게 확인해 보세요.',
        [QLIK_EXPERIENCE_GUIDE_ID]: 'Qlik의 연관 엔진을 사용하여 실제 비즈니스 문제를 해결하는 완전한 분석 환경을 경험해 보세요 — 모든 답변은 신뢰할 수 있고 관리되는 소스를 기반으로 합니다.',
        [CONNECT_VISUALIZE_GUIDE_ID]: '자신의 데이터 소스를 연결하고 분석 앱에 로드하여 바로 분석을 시작하세요 — 실제 데이터로 구동되는 전체 크리에이터 워크플로입니다.',
        [SHARE_GUIDE_ID]: '앱을 공유 공간에 게시하고 권한과 액세스를 설정하여 동료를 테넌트에 초대함으로써, 인사이트가 나 자신을 넘어 영향력을 발휘하도록 하세요.',
        [CURATE_CUSTOMIZE_GUIDE_ID]: '컬렉션을 만들고, Insights 활동 센터를 구성하고, 테넌트를 위한 맞춤형 홈페이지를 만들어 팀의 Qlik 경험을 설계해 보세요.',
        [LEARN_LEVEL_UP_GUIDE_ID]: '짧은 설문조사에 참여하여 역할과 목표에 가장 적합한 학습 경로를 확인하세요 — 맞춤형 추천이 아래에 표시된 여정에 바로 추가됩니다.'
      },
      durationTemplate: '소요 시간: 약 {n}분',
      buttons: { watchNow: '지금 보기 →', takeSurvey: '설문조사 참여 →', startModule: '모듈 시작 →', refresh: '새로고침 ⟳', refreshing: '새로고침 중…' },
      hydrationLoading: '리소스를 아직 불러오는 중입니다. 몇 분 후 다시 확인해 주세요!'
    },
    'zh-CN': {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: '快速了解 Qlik Cloud 试用版提供的所有内容，包括平台结构和主要功能。',
        [QLIK_EXPERIENCE_GUIDE_ID]: '进入功能齐全的分析环境，使用 Qlik 的关联引擎处理真实业务问题——每个答案都基于可信、受管控的数据源。',
        [CONNECT_VISUALIZE_GUIDE_ID]: '连接您自己的数据源，将其加载到分析应用中，立即开始分析——完整的创建者工作流程，由您的真实数据驱动。',
        [SHARE_GUIDE_ID]: '将您的应用发布到共享空间，并邀请同事加入您的租户，设置权限和访问权限，让您的洞察发挥更大的价值。',
        [CURATE_CUSTOMIZE_GUIDE_ID]: '通过构建集合、配置 Insights 活动中心以及为您的租户创建自定义主页，打造团队的 Qlik 体验。',
        [LEARN_LEVEL_UP_GUIDE_ID]: '参与一个简短的调查，以确定与您的角色和目标最相关的学习路径——您的个性化建议将直接添加到下方显示的学习历程中。'
      },
      durationTemplate: '时长：约 {n} 分钟',
      buttons: { watchNow: '立即观看 →', takeSurvey: '参与调查 →', startModule: '开始模块 →', refresh: '刷新 ⟳', refreshing: '正在刷新…' },
      hydrationLoading: '资源仍在加载中，请稍后几分钟再查看！'
    },
    'zh-TW': {
      descriptions: {
        [WELCOME_VIDEO_GUIDE_ID]: '快速了解 Qlik Cloud 試用版提供的所有內容，包括平台結構與主要功能。',
        [QLIK_EXPERIENCE_GUIDE_ID]: '進入功能完整的分析環境，使用 Qlik 的關聯引擎處理真實商業問題——每個答案皆基於可信、受管控的資料來源。',
        [CONNECT_VISUALIZE_GUIDE_ID]: '連接您自己的資料來源，將其載入分析應用程式，立即開始分析——完整的建立者工作流程，由您的真實資料驅動。',
        [SHARE_GUIDE_ID]: '將您的應用程式發佈到共用空間，並邀請同事加入您的租用戶，設定權限與存取權限，讓您的洞察發揮更大的影響力。',
        [CURATE_CUSTOMIZE_GUIDE_ID]: '透過建立集合、設定 Insights 活動中心，以及為您的租用戶建立自訂首頁，打造團隊的 Qlik 體驗。',
        [LEARN_LEVEL_UP_GUIDE_ID]: '參與一份簡短的問卷調查，找出與您的角色和目標最相關的學習路徑——您的個人化建議將直接加入下方顯示的學習歷程中。'
      },
      durationTemplate: '時長：約 {n} 分鐘',
      buttons: { watchNow: '立即觀看 →', takeSurvey: '填寫問卷 →', startModule: '開始模組 →', refresh: '重新整理 ⟳', refreshing: '重新整理中…' },
      hydrationLoading: '資源仍在載入中，請稍後幾分鐘再查看！'
    }
  };

  function resolveLocale(raw) {
    if (!raw) return 'en';
    const value = String(raw).trim();
    const exact = SUPPORTED_LOCALES.find(l => l.toLowerCase() === value.toLowerCase());
    if (exact) return exact;
    const primary = value.split(/[-_]/)[0].toLowerCase();
    // zh needs its region to pick simplified vs traditional; every other
    // supported locale is unambiguous from its primary subtag alone.
    if (primary === 'zh') return /tw|hk|hant/i.test(value) ? 'zh-TW' : 'zh-CN';
    const match = SUPPORTED_LOCALES.find(l => l.toLowerCase() === primary);
    return match || 'en';
  }

  function getLocale() {
    try {
      return resolveLocale(pendo.getSerializedMetadata().visitor.locale);
    } catch (err) {
      return 'en';
    }
  }

  const T = TRANSLATIONS[getLocale()] || TRANSLATIONS.en;

  // Pendo re-runs this whole script every time it shows this step, but the
  // previous run's observer, in-flight hydration fetch and click handlers
  // stay alive. Two runs rendering the same DOM fight each other: each
  // one's render trips the other's observer, and each keeps its own
  // selectedGuideId, so a step click from one run is immediately reverted
  // by the other — the checklist looks unclickable. Each run claims
  // ownership here; anything left over from an older run checks
  // isStaleRun() and does nothing.
  const RUN_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  window.__pmjFirstStepRunId = RUN_ID;
  console.log('firstStep script run', RUN_ID);

  function isStaleRun() {
    return window.__pmjFirstStepRunId !== RUN_ID;
  }

  let hydrationResolved = false;
  let hydrationComplete = false;
  let hydrationFetchInFlight = false;
  // Set once the visitor clicks a step; overrides the auto-computed "next
  // incomplete step" for what NEXT UP displays, and persists across
  // re-renders until they click a different step.
  let selectedGuideId = null;
  // Whichever guide id NEXT UP/Duration currently display — read by the
  // action button's click handler at click-time, since the handler itself
  // is bound only once.
  let currentDisplayGuideId = null;

  function isStepCompleted(li) {
                   console.log('isStepCompleted');
    const circleWrap = li.querySelector('.pendo-task-list-progress-circle');
    if (!circleWrap) return false;
    const svg = circleWrap.querySelector('svg');
    if (!svg) return false;
    return !!svg.querySelector('polyline');
  }

  // There's only one guide for "The Qlik Experience" — QLIK_EXPERIENCE_GUIDE_ID,
  // always. It's locked for as long as hydration hasn't resolved complete —
  // whether that's because the very first fetch hasn't come back yet, or
  // because it came back but wasn't synced.
  function isQlikExperienceLocked(guideId) {
             console.log('isQlikExperienceLocked');
    return guideId === QLIK_EXPERIENCE_GUIDE_ID && !hydrationComplete;
  }

  // Read this step's own list item to get its already-translated title —
  // never hardcode step labels, since Pendo has already localized this
  // exact text through its own translation pipeline by the time it renders.
  function getStepLabel(list, guideId) {
    const li = list.querySelector(`li[data-pendo-show-guide-id="${guideId}"]`);
    const titleEl = li ? li.querySelector('[id^="pendo-text-045b0675-"]') : null;
    return titleEl ? titleEl.textContent.trim() : '';
  }

  // Lock icon laid over a locked module's list item; sized in CSS to fit
  // this step's compact list item.
  function addLockOverlay(li) {
            console.log('add lock overlay');
    if (li.querySelector('.pmj-lock-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'pmj-lock-overlay';
    overlay.innerHTML =
      '<svg viewBox="0 0 24 24" class="pmj-lock-icon" aria-hidden="true">' +
      '<rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '</svg>';
    li.appendChild(overlay);
  }

  function removeLockOverlay(li) {
            console.log('remove overlay');
    const overlay = li.querySelector('.pmj-lock-overlay');
    if (overlay) overlay.remove();
  }

  // The Qlik Experience module never disappears from the checklist — there's
  // no separate "unlocked" guide to swap it for, just this one. While
  // hydration hasn't resolved complete, overlay a lock icon on top of its
  // <li> instead; remove it once unlocked.
  function updateQlikExperienceLockState(list) {
      console.log('update Qlik experience lock state');
    if (!hydrationResolved) return;
    const li = list.querySelector(`li[data-pendo-show-guide-id="${QLIK_EXPERIENCE_GUIDE_ID}"]`);
    if (!li) return;
    li.classList.toggle('pmj-locked', !hydrationComplete);
    if (hydrationComplete) {
      removeLockOverlay(li);
    } else {
      addLockOverlay(li);
    }
  }

  function rebuildConnectors(list, items) {
             console.log('rebuildConnectors');

    list.querySelectorAll('.pmj-connector').forEach(c => c.remove());
    items.forEach((li, i) => {
      if (i === items.length - 1) return;
      const connector = document.createElement('div');
      connector.className = 'pmj-connector';
      // A connector touches two steps (this one and the next); it should
      // turn green if EITHER of them is completed, not just the one
      // before it — otherwise the line leading into a completed step
      // (when the step before it isn't itself done) stays gray.
      if (isStepCompleted(li) || isStepCompleted(items[i + 1])) {
        connector.classList.add('pmj-connector-completed');
      }
      li.after(connector);
    });
  }

  // The NEXT UP paragraph's bold lead-in and description are a rich-text
  // block — Pendo re-parses it into fresh DOM nodes (with fresh ids) on
  // every render, so find them relative to the stable container id rather
  // than hardcoding their own ids. The label always comes from the list
  // item itself (see getStepLabel); the description is either this
  // module's translated copy, or — while the Qlik Experience module is
  // still locked — the hydration-loading message in place of it.
  function updateNextUp(guideId) {
       console.log('updateNextUp');
    const container = document.getElementById(NEXT_UP_TEXT_ID);
    if (!container) return;
    const boldEl = container.querySelector('strong');
    const descEl = container.querySelector('span');
    const list = document.getElementById(LIST_ID);
    const label = list ? getStepLabel(list, guideId) : '';
    const description = isQlikExperienceLocked(guideId) ? T.hydrationLoading : T.descriptions[guideId];
    if (boldEl) boldEl.textContent = label ? (description ? label + ' —' : label) : '';
    if (descEl) descEl.textContent = description ? (label ? ' ' : '') + description : '';
  }

  function updateDuration(guideId) {
            console.log('updateDuration');
    const durationEl = document.getElementById(DURATION_TEXT_ID);
    if (!durationEl) return;
    if (isQlikExperienceLocked(guideId)) {
      durationEl.textContent = '';
      return;
    }
    const minutes = STEP_MINUTES[guideId];
    durationEl.textContent = minutes ? T.durationTemplate.replace('{n}', minutes) : '';
  }

  // The action button's label changes per module: the video gets "Watch
  // now", the survey gets "Take survey", everything else gets "Start
  // module" — except while the Qlik Experience module is still locked,
  // when it becomes the "Refresh" control instead (see bindWatchNowClick).
  function updateActionButton(guideId) {
      console.log('updateActionButton');
    const btn = document.getElementById(WATCH_NOW_BUTTON_ID);
    if (!btn) return;
    if (isQlikExperienceLocked(guideId)) {
      btn.textContent = hydrationFetchInFlight ? T.buttons.refreshing : T.buttons.refresh;
      return;
    }
    if (guideId === WELCOME_VIDEO_GUIDE_ID) {
      btn.textContent = T.buttons.watchNow;
    } else if (guideId === LEARN_LEVEL_UP_GUIDE_ID) {
      btn.textContent = T.buttons.takeSurvey;
    } else {
      btn.textContent = T.buttons.startModule;
    }
  }

  // Clicking a step (its icon or its label — both are inside the same <li>)
  // should update NEXT UP to that module instead of Pendo's default
  // behavior of opening the associated guide. Cloning the <li> strips
  // whatever click handling Pendo itself bound to it/its button, then our own
  // listener on the clone is the only one left to run. Guarded by a data
  // attribute (itself copied onto the clone) so repeated render() calls
  // don't re-clone — and therefore re-strip listeners from — the same
  // node over and over.
  function bindStepClickHandlers(list) {
      console.log('bind step click handler');
    list.querySelectorAll('li').forEach(li => {
      // Compared against RUN_ID (not just "is set") so a <li> bound by an
      // older run gets re-cloned, dropping that run's listener.
      if (li.dataset.pmjClickBound === RUN_ID) return;
      const guideId = li.getAttribute('data-pendo-show-guide-id');
      const newLi = li.cloneNode(true);
      newLi.dataset.pmjClickBound = RUN_ID;
      li.parentNode.replaceChild(newLi, li);
      newLi.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        selectedGuideId = guideId;
        renderProtected();
      });
    });
  }

  function refreshState(list) {
      console.log('refresh state');
    const items = [...list.querySelectorAll('li')].filter(li => !li.classList.contains('pmj-hidden-step'));

    let completedCount = 0;
    let activeIndex = -1;
    items.forEach((li, i) => {
      const completed = isStepCompleted(li);
      li.classList.toggle('pmj-completed', completed);
      if (completed) {
        completedCount++;
      } else if (activeIndex === -1) {
        activeIndex = i;
      }
    });
    if (activeIndex === -1) activeIndex = items.length - 1;

    items.forEach((li, i) => {
      const isActive = i === activeIndex;
      li.classList.toggle('pmj-active', isActive);
      const circle = li.querySelector('.pendo-task-list-progress-circle');
      if (circle) circle.classList.toggle('pmj-active-circle', isActive);
    });

    rebuildConnectors(list, items);

    const percent = items.length ? Math.round((completedCount / items.length) * 100) : 0;
    const fillEl = document.getElementById(PROGRESS_FILL_ID);
    const textEl = document.getElementById(PROGRESS_TEXT_ID);
    if (fillEl) fillEl.style.setProperty('width', percent + '%', 'important');
    if (textEl) textEl.textContent = percent + '%';

    const activeLi = items[activeIndex];
    const activeGuideId = activeLi ? activeLi.getAttribute('data-pendo-show-guide-id') : null;
    currentDisplayGuideId = selectedGuideId || activeGuideId;
    updateNextUp(currentDisplayGuideId);
    updateDuration(currentDisplayGuideId);
    updateActionButton(currentDisplayGuideId);
    updateAddOnChooser(currentDisplayGuideId);
  }

  // Unlocked: the action button launches whichever module NEXT UP shows.
  // Bound once per run (guarded by a data attribute) since the button
  // itself is never moved or recreated by relocateNextUpControls — only
  // read at click-time via currentDisplayGuideId, which refreshState keeps
  // up to date. The locked (Refresh) case never reaches this listener —
  // see bindRefreshClick.
  function bindWatchNowClick() {
      console.log('bind watch now click');
    const watchNowButton = document.getElementById(WATCH_NOW_BUTTON_ID);
    if (!watchNowButton || watchNowButton.dataset.pmjClickBound === RUN_ID) return;
    watchNowButton.dataset.pmjClickBound = RUN_ID;
    watchNowButton.addEventListener('click', function (e) {
      if (isStaleRun()) return;
      e.preventDefault();
      if (currentDisplayGuideId) pendo.showGuideById(currentDisplayGuideId);
    });
  }

  // While NEXT UP is showing the still-locked Qlik Experience module, the
  // action button re-runs the hydration check instead of launching a guide;
  // fetchHydrationStatus's own re-render afterward picks up whatever it
  // resolved to (back to translated Watch Now/Start module copy, plus the
  // unlocked module's own description, if it's now synced — otherwise
  // still the Refresh control).
  //
  // It's a real Pendo button, so the action authored on it in the designer
  // (bound by Pendo before this script runs) fires on every click too —
  // preventDefault() doesn't stop it. As Refresh, that action re-shows the
  // guide mid-refresh, which re-renders the step and re-runs this script.
  // A capture-phase listener on document runs before any listener on the
  // button itself, so stopPropagation() here keeps the click from ever
  // reaching Pendo's. Unlocked clicks pass straight through untouched.
  // Bound on document, once per run; older runs' listeners bail out via
  // isStaleRun().
  function bindRefreshClick() {
    document.addEventListener('click', function (e) {
      if (isStaleRun()) return;
      const watchNowButton = document.getElementById(WATCH_NOW_BUTTON_ID);
      if (!watchNowButton || !watchNowButton.contains(e.target)) return;
      if (!isQlikExperienceLocked(currentDisplayGuideId)) return;
      console.log('refresh click intercepted', RUN_ID);
      e.preventDefault();
      e.stopPropagation();
      if (hydrationFetchInFlight) return;
      // Sets hydrationFetchInFlight first, so updateActionButton (run by
      // the observer re-render this text change triggers) keeps showing
      // "Refreshing…" instead of flipping straight back to "Refresh".
      fetchHydrationStatus();
      watchNowButton.textContent = T.buttons.refreshing;
    }, true);
  }

  // A visitor is only "eligible" for an add-on once its own segmented guide
  // exists for them.
  function hasEligibleAddOns() {
    return Object.values(addOnGuideMap).some(config => !!pendo.findGuideById(config.segmentedGuideId));
  }

  // The addOnChooser table (pasted from minimizedVersion.html into a code
  // block) only ever shows for the Learn & Level-up module, and even then
  // only once the visitor is actually eligible for at least one add-on —
  // otherwise it's an empty row of nothing they can act on. Hidden by
  // setting display directly on the table, since a <table> doesn't
  // collapse the way a Pendo row does. When shown, every option stays
  // visible; only eligible ones get is-active (a green border in CSS).
  // Per-cell eligibility is recomputed every render since add-on
  // eligibility can change without a full page reload (e.g. right after
  // finishing the survey that grants it).
  function updateAddOnChooser(guideId) {
      console.log('update add on chooser');
    const chooser = document.getElementById(ADD_ON_CHOOSER_ID);
    if (!chooser) return;
    const shouldShow = guideId === LEARN_LEVEL_UP_GUIDE_ID && hasEligibleAddOns();
    chooser.style.setProperty('display', shouldShow ? 'flex' : 'none', 'important');
    if (!shouldShow) return;
    Object.entries(addOnGuideMap).forEach(([cls, config]) => {
      const segmentedGuide = pendo.findGuideById(config.segmentedGuideId);
      chooser.querySelector(`.${cls}`)?.classList.toggle('is-active', !!segmentedGuide);
    });
  }

  // Clicking any cell launches its guide, regardless of that cell's
  // is-active state — only the highlighting and the table's own overall
  // visibility above are gated on eligibility, not the click. Bound once
  // via event delegation on the table itself, since Pendo can rebuild the
  // table's contents across renders.
  function bindAddOnChooserClick() {
      console.log('bind addon Chooser Click');
    const chooser = document.getElementById(ADD_ON_CHOOSER_ID);
    if (!chooser || chooser.dataset.pmjClickBound === RUN_ID) return;
    chooser.dataset.pmjClickBound = RUN_ID;
    chooser.addEventListener('click', function (e) {
      if (isStaleRun()) return;
      const option = e.target.closest('.guide-image');
      if (!option) return;
      const cls = [...option.classList].find(c => addOnGuideMap[c]);
      if (!cls) return;
      e.preventDefault();
      e.stopPropagation();
      pendo.showGuideById(addOnGuideMap[cls].launchGuideId);
    });
  }

  // Duration/Watch-now were authored as their own separate row below NEXT
  // UP; move them into NEXT UP's own flex row so both live in the same
  // horizontal bar (NEXT UP + title on the left, Duration + Watch now
  // pushed to the right via margin-left:auto in CSS), matching the target.
  function relocateNextUpControls() {
    const nextUpRow = document.getElementById(NEXT_UP_ROW_ID);
    const nextUpFlexRow = nextUpRow ? nextUpRow.querySelector('.pendo-mock-flexbox-row') : null;
    if (!nextUpFlexRow) return;

    let rightCluster = nextUpFlexRow.querySelector('.pmj-nextup-right');
    if (!rightCluster) {
      rightCluster = document.createElement('div');
      rightCluster.className = 'pmj-nextup-right';
      nextUpFlexRow.appendChild(rightCluster);
    }

    const durationText = document.getElementById(DURATION_TEXT_ID);
    const watchNowButton = document.getElementById(WATCH_NOW_BUTTON_ID);
    if (durationText && durationText.parentElement !== rightCluster) rightCluster.appendChild(durationText);
    if (watchNowButton && watchNowButton.parentElement !== rightCluster) rightCluster.appendChild(watchNowButton);
  }

  // "NEXT UP" and the Welcome Video paragraph are the row's two
  // .pendo-mock-flexbox-element children; mark each with a class so the CSS
  // can give them opposite flex behavior (fixed-width vs. the one element
  // allowed to shrink/wrap) without relying on DOM order or :has().
  function markNextUpFlexRoles() {
    const fixedWrapper = document.getElementById(NEXT_UP_LABEL_ID)?.closest('.pendo-mock-flexbox-element');
    const flexWrapper = document.getElementById(NEXT_UP_TEXT_ID)?.closest('.pendo-mock-flexbox-element');
    if (fixedWrapper) fixedWrapper.classList.add('pmj-nextup-fixed');
    if (flexWrapper) flexWrapper.classList.add('pmj-nextup-flex');
  }

  // The Pendo <hr> divider between the checklist and NEXT UP was deleted in
  // the designer, so insert our own in the same spot instead of depending
  // on an element that may no longer exist. Any previous one is removed
  // first and a fresh one re-inserted right before the NEXT UP row, so this
  // stays correct even after Pendo rebuilds the surrounding DOM.
  function ensureDivider() {
    const container = document.getElementById(GUIDE_CONTAINER_ID);
    const nextUpRow = document.getElementById(NEXT_UP_ROW_ID);
    if (!container || !nextUpRow) return;
    container.querySelectorAll(':scope > .pmj-divider').forEach(d => d.remove());
    const divider = document.createElement('hr');
    divider.className = 'pmj-divider';
    nextUpRow.before(divider);
  }

  // The outer guide box carries a stale designer-time pixel height; force it
  // back to auto so it always fits the (much shorter) compact bar content.
  function fixStepContainerHeight() {
    const stepContainer = document.getElementById(GUIDE_CONTAINER_ID)?.closest('._pendo-step-container-size');
    if (stepContainer) stepContainer.style.setProperty('height', 'auto', 'important');
  }

  function render() {
      console.log('render');
    const list = document.getElementById(LIST_ID);
    if (!list) return;
    // Must run before updateQlikExperienceLockState/refreshState below,
    // since it replaces each <li> with a clone — everything after this
    // re-queries the list fresh, so it naturally picks up the clones.
    bindStepClickHandlers(list);
    updateQlikExperienceLockState(list);
    refreshState(list);
    relocateNextUpControls();
    markNextUpFlexRoles();
    ensureDivider();
    bindWatchNowClick();
    bindAddOnChooserClick();
    fixStepContainerHeight();
  }

  function fetchHydrationStatus() {
      console.log('fetch hydration status');
    hydrationFetchInFlight = true;
    fetch('/api/core/hydration-configurations/me', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        hydrationComplete = !!(data && data.status === 'synced');
      })
      .catch(err => {
        console.error('Error fetching hydration status, defaulting hydrationComplete to false:', err);
        hydrationComplete = false;
      })
      .then(() => {
        hydrationResolved = true;
        hydrationFetchInFlight = false;
          console.log('hydration complete! do renderProtected next'); 
        renderProtected();
      });
  }

  // Pendo can rebuild this step's DOM from its authored template on its own
  // (observed on window resize) — that wipes the relocations/relabeling
  // above since they only ran once at load. Re-run everything whenever the
  // guide's DOM actually changes. Every call goes through renderProtected,
  // which disconnects the observer first — render() itself mutates the DOM
  // (relabeling, moving nodes, rebuilding connectors), and without this an
  // observer callback's own render() would immediately re-trigger itself.
  const observedRoot = document.getElementById(GUIDE_CONTAINER_ID)?.closest('._pendo-step-container-size') || document.body;
  let renderScheduled = false;

  function renderProtected() {
          console.log('render protected');
    observer.disconnect();
    // A newer run owns the DOM now — stop for good (observer stays
    // disconnected) instead of fighting it.
    if (isStaleRun()) {
      console.log('stale firstStep run, stopping', RUN_ID);
      return;
    }
    render();
    observer.observe(observedRoot, { childList: true, subtree: true });
  }

  const observer = new MutationObserver(() => {
                         console.log('observer');
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      renderProtected();
    });
  });
  observer.observe(observedRoot, { childList: true, subtree: true });

  bindRefreshClick();
  fetchHydrationStatus();

  }
})();
