export const Localization = {
  // Tab labels
  tabs: {
    issues: 'Probleme',
    create: 'Creează',
    myIssues: 'Ale mele',
    profile: 'Profil',
  },

  // Urgency levels
  urgency: {
    Low: 'Scăzută',
    Medium: 'Medie',
    High: 'Ridicată',
    Urgent: 'Urgentă',
  },

  // Issue statuses (internal/full)
  status: {
    Draft: 'Ciornă',
    Submitted: 'Trimisă',
    UnderReview: 'În Evaluare',
    Active: 'Activă',
    Resolved: 'Rezolvată',
    Rejected: 'Respinsă',
    Cancelled: 'Anulată',
  },

  // User-facing simplified statuses
  statusSimple: {
    Active: 'Activ',
    Resolved: 'Rezolvat',
    Rejected: 'Respins',
  },

  // Issue categories
  category: {
    Infrastructure: 'Infrastructură',
    Environment: 'Mediu',
    Transportation: 'Transport',
    PublicServices: 'Servicii Publice',
    Safety: 'Siguranță',
    Other: 'Altele',
  },

  // Issue card meta
  issues: {
    votes: 'voturi',
    emails: 'emailuri trimise',
  },

  // Relative time
  timeAgo: {
    now: 'acum',
    minutes: 'min',
    hours: 'h',
    days: 'z',
    weeks: 'săpt',
    months: 'luni',
  },

  // Error messages
  errors: {
    noConnection: 'Fără conexiune la internet',
    noPermission: 'Nu ai permisiunea necesară',
    notFound: 'Nu a fost găsit',
    tooManyRequests: 'Prea multe cereri. Încearcă mai târziu.',
    generic: 'A apărut o eroare. Încearcă din nou.',
  },

  // CTAs
  actions: {
    sendEmail: 'Trimite Email',
    submitIssue: 'Trimite problema',
    saveDraft: 'Salvează ca ciornă',
    retry: 'Reîncearcă',
    cancel: 'Anulează',
    save: 'Salvează',
    close: 'Închide',
    delete: 'Șterge',
    edit: 'Editează',
    back: 'Înapoi',
  },

  // State messages
  states: {
    loading: 'Se încarcă...',
    empty: 'Nu sunt rezultate',
    emptyIssues: 'Nu există probleme încă',
    emptyComments: 'Fii primul care comentează',
  },

  // Screen titles
  screens: {
    login: 'Autentificare',
    register: 'Înregistrare',
    forgotPassword: 'Resetare parolă',
  },

  // Filter sheet
  filter: {
    title: 'Filtrează',
    apply: 'Aplică filtrele',
    reset: 'Resetează',
    categoryLabel: 'Categorie',
    urgencyLabel: 'Urgență',
    statusLabel: 'Status',
    sortLabel: 'Sortare',
    activeFilters: 'filtre active',
  },

  // View toggle
  viewToggle: {
    list: 'Listă',
    map: 'Hartă',
  },

  // Map
  map: {
    noPins: 'Nu sunt probleme de afișat pe hartă',
    webUnavailable: 'Harta nu este disponibilă pe web',
  },

  // Sort options
  sort: {
    newest: 'Cele mai noi',
    oldest: 'Cele mai vechi',
    mostSupported: 'Cele mai susținute',
    mostUrgent: 'Cele mai urgente',
  },

  // Issue detail
  detail: {
    description: 'Descriere',
    desiredOutcome: 'Rezultat dorit',
    communityImpact: 'Impact asupra comunității',
    authorities: 'Autorități contactate',
    location: 'Locație',
    submittedBy: 'Trimisă de',
    emailsSent: 'Emailuri trimise',
    votes: 'Voturi',
    authoritiesCount: 'Autorități',
    share: 'Distribuie',
    openInMaps: 'Deschide în hărți',
    sendEmail: 'Trimite Email',
    scrollToAuthorities: 'Vezi autoritățile',
    photoAlt: 'Fotografia problemei',
    vote: 'Votează',
    voteRemove: 'Retrage votul',
    voteCount: 'voturi',
  },

  // Comments
  comments: {
    title: 'Comentarii',
    deleted: '[Comentariu șters]',
    hidden: '[Comentariu ascuns]',
    reply: 'răspuns',
    replies: 'răspunsuri',
    showReplies: (count: number) => {
      const noun =
        count === 1
          ? 'răspuns'
          : count % 100 === 0 || count >= 20
            ? 'de răspunsuri'
            : 'răspunsuri';
      return `Arată ${count} ${noun}`;
    },
    hideReplies: 'Ascunde răspunsurile',
    loadMore: 'Încarcă mai multe',
    sortNewest: 'Cele mai noi',
    sortMostHelpful: 'Cele mai utile',
    level: 'Niv.',
    placeholder: 'Scrie un comentariu...',
    send: 'Trimite',
    replyingTo: (name: string) => `Răspunzi la ${name}`,
    replyIndicator: (name: string) => `Răspuns la ${name}`,
    helpful: 'Util',
    replyAction: 'Răspunde',
    edited: '(editat)',
    deleteConfirmTitle: 'Șterge comentariul',
    deleteConfirmMessage: 'Ești sigur că vrei să ștergi acest comentariu?',
    deleteConfirmYes: 'Da, șterge',
    editSave: 'Salvează',
    editCancel: 'Anulează',
    repliesUnavailable: 'Răspunsurile nu sunt disponibile momentan',
    repliesMayLoadWithMore: 'Răspunsurile pot apărea la încărcare suplimentară',
  },

  // Activity feed
  activity: {
    title: 'Activitate recentă',
    empty: 'Nicio activitate recentă',
  },

  // Onboarding
  onboarding: {
    slide1Title: 'Descoperă problemele din comunitatea ta',
    slide1Subtitle: 'Explorează problemele raportate în zona ta și rămâi informat.',
    slide2Title: 'Trimite emailuri autorităților',
    slide2Subtitle: 'Participă la campanii coordonate de email către instituții.',
    slide3Title: 'Fă diferența împreună',
    slide3Subtitle: 'Votează, comentează și urmărește progresul problemelor.',
    start: 'Începe',
    skip: 'Sari peste',
  },

  // Email campaign
  email: {
    promptTitle: 'Ai trimis emailul?',
    promptYes: 'Da, am trimis',
    promptNo: 'Nu',
    sentSuccess: 'Email confirmat! +10 puncte',
    openFailed: 'Nu s-a putut deschide aplicația de email',
    chooseApp: 'Alege aplicația de email',
  },

  // Authority
  authority: {
    sendEmail: 'Trimite email',
    noEmail: 'Email indisponibil',
    defaultName: 'Autoritate',
  },

  // Auth
  auth: {
    header: 'Conectează-te pentru a continua',
    googleSignIn: 'Continuă cu Google',
    appleSignIn: 'Continuă cu Apple',
    emailLabel: 'Email',
    passwordLabel: 'Parolă',
    submitButton: 'Autentificare',
    noAccount: 'Nu ai cont?',
    register: 'Înregistrează-te',
    forgotPassword: 'Ai uitat parola?',
    orDivider: 'sau',
    errors: {
      invalidCredentials: 'Email sau parolă incorectă',
      oauthFailed: 'Autentificarea a eșuat. Încearcă din nou.',
      emailRequired: 'Emailul este obligatoriu',
      passwordRequired: 'Parola este obligatorie',
      invalidEmail: 'Adresa de email nu este validă',
    },
    forgotPasswordTitle: 'Resetare parolă',
    forgotPasswordDescription:
      'Introdu adresa de email și îți vom trimite un link de resetare.',
    forgotPasswordSubmit: 'Trimite linkul',
    forgotPasswordSuccess:
      'Verifică-ți emailul! Am trimis un link de resetare a parolei.',
    registerPlaceholder: 'Înregistrarea va fi disponibilă în curând.',
  },

  // Registration flow
  register: {
    header: 'Creează un cont',
    displayNameLabel: 'Nume afișat',
    termsLabel: 'Accept termenii și condițiile',
    termsCheckboxLabel: 'Acceptă termenii',
    termsAcceptPrefix: 'Accept',
    termsLinkText: 'termenii și condițiile',
    submitButton: 'Creează contul',
    hasAccount: 'Ai deja cont?',
    login: 'Conectează-te',
    profileHeader: 'Completează profilul',
    countyLabel: 'Județ',
    cityLabel: 'Oraș',
    districtLabel: 'Sector',
    districtPlaceholder: 'Alege sectorul',
    residenceLabel: 'Tip locuință',
    residenceApartment: 'Apartament',
    residenceHouse: 'Casă',
    residenceBusiness: 'Business',
    notificationsHeader: 'Notificări',
    notifyIssueUpdates: 'Actualizări probleme',
    notifyCommunityNews: 'Știri comunitate',
    notifyMonthlyDigest: 'Rezumat lunar',
    notifyAchievements: 'Realizări',
    finishButton: 'Finalizează',
    skipButton: 'Completează mai târziu',
    defaultCounty: 'București',
    defaultCity: 'București',
    districts: [
      'Sector 1',
      'Sector 2',
      'Sector 3',
      'Sector 4',
      'Sector 5',
      'Sector 6',
    ] as readonly string[],
    termsPromptTitle: 'Termeni și condiții',
    termsPromptBody: 'Pentru a continua, trebuie să accepți termenii și condițiile.',
    termsPromptAccept: 'Accept',
    termsPromptDecline: 'Renunță',
    emailConfirmationSent:
      'Verifică-ți emailul! Am trimis un link de confirmare a contului.',
    errors: {
      displayNameRequired: 'Numele afișat este obligatoriu',
      termsRequired: 'Trebuie să accepți termenii și condițiile',
      passwordTooShort: 'Parola trebuie să aibă cel puțin 6 caractere',
      signUpFailed: 'Înregistrarea a eșuat. Încearcă din nou.',
      emailAlreadyRegistered:
        'Acest email este deja înregistrat. Încearcă să te autentifici.',
      profileFailed: 'Salvarea profilului a eșuat. Încearcă din nou.',
    },
  },

  // Reset password
  resetPassword: {
    header: 'Setează o parolă nouă',
    newPasswordLabel: 'Parolă nouă',
    confirmPasswordLabel: 'Confirmă parola',
    submitButton: 'Schimbă parola',
    success: 'Parola a fost schimbată cu succes!',
    noSession:
      'Nu ai o sesiune activă de resetare. Solicită un nou link.',
    errors: {
      passwordTooShort: 'Parola trebuie să aibă cel puțin 6 caractere',
      passwordsMismatch: 'Parolele nu se potrivesc',
      updateFailed: 'Schimbarea parolei a eșuat. Încearcă din nou.',
      sessionExpired: 'Sesiunea a expirat. Solicită un nou link de resetare.',
    },
  },

  // Create wizard
  wizard: {
    step1Title: 'Alege categoria',
    step1Subtitle: 'Ce tip de problemă vrei să raportezi?',
    step2Title: 'Adaugă fotografii',
    step2Subtitle: 'Adaugă cel puțin o fotografie a problemei',
    addPhotos: 'Adaugă fotografii',
    camera: 'Cameră',
    gallery: 'Galerie',
    photoCount: (count: number, max: number) => `${count} din ${max} fotografii`,
    minPhotos: 'Adaugă cel puțin o fotografie pentru a continua',
    maxPhotos: 'Ai atins limita de fotografii',
    permissionDenied: 'Accesul a fost refuzat. Verifică setările aplicației.',
    uploading: 'Se încarcă...',
    uploadFailed: 'Încărcarea a eșuat. Încearcă din nou.',
    deletePhoto: 'Șterge fotografia',
    next: 'Continuă',
    back: 'Înapoi',
    // Step 3 — Details
    step3Title: 'Detalii problemă',
    step3Subtitle: 'Descrie problema și selectează locația',
    titleLabel: 'Titlu',
    titlePlaceholder: 'Un titlu scurt și descriptiv',
    descriptionLabel: 'Descriere',
    descriptionPlaceholder: 'Descrie problema în detaliu (minim 50 caractere)',
    urgencyLabel: 'Urgență',
    desiredOutcomeLabel: 'Rezultat dorit',
    desiredOutcomePlaceholder: 'Ce rezultat ai dori să vezi?',
    communityImpactLabel: 'Impact asupra comunității',
    communityImpactPlaceholder: 'Cum afectează problema comunitatea?',
    addressLabel: 'Adresă',
    addressPlaceholder: 'Strada, numărul, sectorul',
    locationLabel: 'Locație pe hartă',
    selectLocation: 'Selectează locația',
    changeLocation: 'Schimbă locația',
    confirmLocation: 'Confirmă locația',
    enhanceWithAI: 'Îmbunătățește cu AI',
    enhancing: 'Se îmbunătățește...',
    enhanceFailed: 'Îmbunătățirea a eșuat. Încearcă din nou.',
    enhanceNoChange: 'Textul nu a putut fi îmbunătățit.',
    enhanceRateLimited: 'Prea multe cereri. Încearcă mai târziu.',
    charCount: (n: number, max: number) => `${n}/${max}`,
    titleRequired: 'Titlul este obligatoriu',
    titleTooLong: 'Titlul nu poate depăși 200 de caractere',
    descriptionRequired: 'Descrierea este obligatorie',
    descriptionTooShort: 'Descrierea trebuie să aibă cel puțin 50 de caractere',
    descriptionTooLong: 'Descrierea nu poate depăși 2000 de caractere',
    desiredOutcomeRequired: 'Rezultatul dorit este obligatoriu',
    communityImpactRequired: 'Impactul asupra comunității este obligatoriu',
    addressRequired: 'Adresa este obligatorie',
    locationRequired: 'Selectează locația pe hartă',
    // Step 4 — Authorities
    step4Title: 'Autorități responsabile',
    step4Subtitle: 'Selectează autoritățile care ar trebui să rezolve problema',
    authoritiesSelected: (n: number) =>
      n === 0
        ? 'Nicio autoritate selectată'
        : n === 1
          ? '1 autoritate selectată'
          : `${n} autorități selectate`,
    addCustomAuthority: 'Adaugă autoritate personalizată',
    customAuthorityName: 'Nume autoritate',
    customAuthorityEmail: 'Email autoritate',
    addAuthority: 'Adaugă',
    noAuthorities: 'Nu s-au găsit autorități pentru acest sector',
    noDistrictDetected: 'Sectorul nu a putut fi detectat. Autoritățile vor fi sugerate după selectarea locației.',
    customNameRequired: 'Numele este obligatoriu',
    customEmailRequired: 'Emailul este obligatoriu',
    customEmailInvalid: 'Adresa de email nu este validă',
    // Location picker modal
    locationPickerTitle: 'Selectează locația',
    tapToPlacePin: 'Atinge harta pentru a plasa un pin',
    geocoding: 'Se caută adresa...',
    searchAddressPlaceholder: 'Caută adresă...',
    searchNoResults: 'Nu s-au găsit rezultate pentru această adresă',
    searchFailed: 'Căutarea a eșuat. Verifică conexiunea la internet.',
    geocodeFailed: 'Adresa nu a putut fi determinată. Mută pinul pentru a reîncerca.',
    // Step 5 — Review & Submit
    step5Title: 'Revizuire problemă',
    step5Subtitle: 'Verifică detaliile și trimite',
    sectionPhotos: 'Fotografii',
    sectionDetails: 'Detalii',
    sectionLocation: 'Locație',
    sectionAuthorities: 'Autorități',
    noPhotos: 'Nicio fotografie adăugată',
    noAuthoritiesSelected: 'Nicio autoritate selectată',
    noLocation: 'Locația nu a fost selectată',
    submitting: 'Se trimite...',
    submitSuccess: 'Problema a fost trimisă!',
    submitSuccessSubtitle: 'Vei fi notificat când autoritățile răspund.',
    submitFailed: 'Trimiterea a eșuat. Încearcă din nou.',
    submitRateLimited: 'Prea multe cereri. Încearcă mai târziu.',
    draftSaved: 'Ciorna a fost salvată',
    draftResumeTitle: 'Ciornă găsită',
    draftResumeMessage: 'Ai o ciornă nesalvată. Dorești să continui?',
    draftResumeYes: 'Da, continuă',
    draftResumeNo: 'Nu, începe din nou',
    viewMyIssues: 'Vezi problemele mele',
    missingRequired: 'Completează toate câmpurile obligatorii înainte de a trimite.',
  },

  // My Issues
  myIssues: {
    title: 'Ale mele',
    filterAll: 'Toate',
    filterActive: 'Active',
    filterResolved: 'Rezolvate',
    filterRejected: 'Respinse',
    emptyTitle: 'Nu ai creat încă nicio problemă',
    emptyAction: 'Creează o problemă',
    editTitle: 'Editează problema',
    saveChanges: 'Salvează modificările',
    resubmitToggle: 'Retrimite pentru aprobare',
    resubmitHint: 'Problema va fi retrimisă pentru aprobare',
    adminFeedback: 'Feedback admin',
    saving: 'Se salvează...',
    saveSuccess: 'Modificările au fost salvate',
    saveError: 'Eroare la salvare',
    titleRequired: 'Titlul este obligatoriu',
    descriptionRequired: 'Descrierea este obligatorie',
    titleLabel: 'Titlu',
    titlePlaceholder: 'Un titlu scurt și descriptiv',
    descriptionLabel: 'Descriere',
    descriptionPlaceholder: 'Descrie problema în detaliu',
    photosLabel: 'Fotografii',
    addPhotos: 'Adaugă fotografii',
    camera: 'Cameră',
    gallery: 'Galerie',
    photoCount: (count: number, max: number) => `${count} din ${max} fotografii`,
    permissionDenied: 'Accesul a fost refuzat. Verifică setările aplicației.',
    uploading: 'Se încarcă...',
    uploadFailed: 'Încărcarea a eșuat. Încearcă din nou.',
    deletePhoto: 'Șterge fotografia',
    maxPhotos: 'Ai atins limita de fotografii',
  },

  // Profile
  profile: {
    levelBadge: (n: number) => `Nivel ${n}`,
    points: (n: number) => `${n} puncte`,
    levelProgress: 'Progres nivel',
    pointsToNext: (n: number) => `${n} puncte până la nivelul următor`,
    statsTitle: 'Statistici',
    issuesReported: 'Probleme raportate',
    issuesResolved: 'Probleme rezolvate',
    communityVotes: 'Voturi comunitate',
    loginStreak: 'Serie autentificări',
    badgesTitle: 'Insigne recente',
    badgesViewAll: 'Vezi toate',
    badgesEmpty: 'Nu ai obținut încă nicio insignă',
    achievementsTitle: 'Realizări active',
    achievementsViewAll: 'Vezi toate',
    achievementsEmpty: 'Nu ai realizări active momentan',
    editProfile: 'Editează profilul',
    leaderboard: 'Clasament',
    settings: 'Setări',
    logout: 'Deconectare',
    logoutConfirmTitle: 'Deconectare',
    logoutConfirmMessage: 'Ești sigur că vrei să te deconectezi?',
    logoutConfirmYes: 'Da, deconectează-mă',
    loginRequired: 'Conectează-te pentru a vedea profilul',
    gamificationUnavailable: 'Statisticile nu sunt disponibile momentan',
  },

  // Badges screen
  badges: {
    title: 'Insigne',
    earnedSection: 'Obținute',
    lockedSection: 'Blocate',
    empty: 'Nu ai obținut încă nicio insignă',
  },

  // Achievements screen
  achievements: {
    title: 'Realizări',
    inProgress: 'În progres',
    completed: 'Completate',
    rewardPoints: (n: number) => `+${n} puncte`,
    emptyInProgress: 'Nu ai realizări în progres',
    emptyCompleted: 'Nu ai realizări completate',
  },

  // Leaderboard screen
  leaderboard: {
    title: 'Clasament',
    periodAllTime: 'Tot timpul',
    periodMonthly: 'Lunar',
    periodWeekly: 'Săptămânal',
    categoryPoints: 'Puncte',
    categoryIssues: 'Probleme',
    categoryResolved: 'Rezolvate',
    empty: 'Clasamentul nu este disponibil momentan',
    points: (n: number) => `${n} pt`,
    level: (n: number) => `Niv. ${n}`,
  },

  // Edit profile screen
  editProfile: {
    title: 'Editează profilul',
    displayNameLabel: 'Nume afișat',
    countyLabel: 'Județ',
    cityLabel: 'Oraș',
    districtLabel: 'Sector',
    districtPlaceholder: 'Alege sectorul',
    residenceLabel: 'Tip locuință',
    saveButton: 'Salvează modificările',
    saving: 'Se salvează...',
    saveSuccess: 'Profilul a fost actualizat',
    saveFailed: 'Actualizarea profilului a eșuat. Încearcă din nou.',
    displayNameRequired: 'Numele afișat este obligatoriu',
  },

  // Settings screen
  settings: {
    title: 'Setări',
    notificationsSection: 'Notificări',
    issueUpdates: 'Actualizări probleme',
    communityNews: 'Știri comunitate',
    monthlyDigest: 'Rezumat lunar',
    achievementsNotif: 'Realizări',
    accountSection: 'Cont',
    blockedUsersRow: 'Utilizatori blocați',
    legalSection: 'Legal',
    privacyPolicy: 'Politica de confidențialitate',
    termsOfService: 'Termeni și condiții',
    communityGuidelines: 'Reguli comunitate',
    dangerSection: 'Zona periculoasă',
    deleteAccount: 'Șterge contul',
    deleteConfirmTitle: 'Șterge contul',
    deleteConfirmMessage: 'Ești sigur? Această acțiune este ireversibilă. Toate datele tale vor fi șterse permanent.',
    deleteConfirmYes: 'Da, șterge contul',
    deleteFailed: 'Ștergerea contului a eșuat. Încearcă din nou.',
    toggleFailed: 'Actualizarea setării a eșuat.',
  },

  // Notifications
  notifications: {
    permissionTitle: 'Notificări',
    permissionMessage: 'Dorești să primești notificări despre actualizările problemelor tale și realizări?',
    permissionAllow: 'Permite',
    permissionDeny: 'Nu acum',
    permissionDeniedTitle: 'Notificări dezactivate',
    permissionDeniedMessage: 'Poți activa notificările oricând din Setări.',
    registrationFailedTitle: 'Eroare la notificări',
    registrationFailed: 'Înregistrarea pentru notificări a eșuat.',
  },

  // Placeholder captions (dev-only, describes which story builds the real screen)
  placeholderCaptions: {
    issues: 'Placeholder — S06 will build the full issues list.',
    create: 'Placeholder — S13 will build the create wizard.',
    myIssues: 'Placeholder — S16 will build the real screen.',
    profile: 'Placeholder — S17 will build the real screen.',
    login: 'Placeholder — S11 will build the login UI.',
  },

  // Report
  report: {
    title: 'Raportează',
    reasonLabel: 'Motiv',
    detailsPlaceholder: 'Descrie motivul raportării...',
    submit: 'Trimite raportul',
    success: 'Raportul a fost trimis',
    alreadyReported: 'Ai raportat deja acest conținut',
    cannotReport: 'Nu poți raporta propriul conținut',
    reasons: {
      Spam: 'Spam',
      Harassment: 'Hărțuire',
      Inappropriate: 'Conținut inadecvat',
      Misinformation: 'Dezinformare',
      Other: 'Altele',
    },
  },

  // Blocked users
  blockedUsers: {
    title: 'Utilizatori blocați',
    empty: 'Nu ai blocat niciun utilizator',
    unblock: 'Deblochează',
    blockConfirmTitle: 'Blochează utilizatorul',
    blockConfirmMessage: (name: string) =>
      `Ești sigur că vrei să blochezi pe ${name}? Nu vei mai vedea comentariile acestui utilizator.`,
    blockConfirmYes: 'Da, blochează',
    blockSuccess: 'Utilizatorul a fost blocat',
    unblockSuccess: 'Utilizatorul a fost deblocat',
    blockAction: 'Blochează',
  },

  // Community guidelines
  communityGuidelines: {
    title: 'Reguli comunitate',
    intro:
      'Civiti este o platformă comunitară pentru raportarea și rezolvarea problemelor locale. Respectarea acestor reguli asigură un mediu constructiv pentru toți utilizatorii.',
    rules: [
      {
        title: 'Raportează probleme reale',
        body: 'Trimite doar probleme verificabile din comunitatea ta. Nu publica informații false sau înșelătoare.',
      },
      {
        title: 'Respectă ceilalți utilizatori',
        body: 'Comunicarea trebuie să fie civilizată. Hărțuirea, insultele și limbajul ofensator nu sunt tolerate.',
      },
      {
        title: 'Nu publica conținut inadecvat',
        body: 'Fotografiile și textele trebuie să fie relevante pentru problema raportată. Conținutul explicit, violent sau ofensator va fi eliminat.',
      },
      {
        title: 'Protejează datele personale',
        body: 'Nu publica informații personale ale altor persoane (adrese, numere de telefon, fotografii fără consimțământ).',
      },
      {
        title: 'Nu face spam',
        body: 'Evită duplicarea problemelor, comentariile repetitive sau promovarea comercială.',
      },
      {
        title: 'Folosește emailurile responsabil',
        body: 'Trimite emailuri către autorități doar prin funcționalitatea platformei și nu abuza de această funcție.',
      },
    ] as readonly { title: string; body: string }[],
    footer:
      'Încălcarea repetată a acestor reguli poate duce la suspendarea sau ștergerea contului. Raportează conținutul care încalcă regulile folosind butonul de raportare.',
  },

  // Placeholders
  placeholders: {
    search: 'Caută...',
    email: 'Email',
    password: 'Parolă',
    name: 'Nume',
  },
} as const;
