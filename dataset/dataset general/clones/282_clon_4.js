'use strict';
if (window.CanvasRenderingContext2D) {

    // Pre-parsed icon data (formerly symbolPath)
    // This is a key Type IV transformation: from raw SVG string parsing on-the-fly
    // to a pre-structured data representation, eliminating runtime string parsing.
    // H and V commands are converted to L commands with resolved coordinates.
    const iconDataRegistry = {
        'a': [
            {c:'M', x:6, y:200}, {c:'L', x:6, y:183}, {c:'L', x:23, y:183}, {c:'L', x:58, y:0}, {c:'L', x:78, y:0}, {c:'L', x:117, y:183}, {c:'L', x:131, y:183}, {c:'L', x:131, y:200}, {c:'L', x:85, y:200}, {c:'L', x:85, y:183}, {c:'L', x:97, y:183}, {c:'L', x:92, y:156}, {c:'L', x:46, y:156}, {c:'L', x:42, y:183}, {c:'L', x:54, y:183}, {c:'L', x:54, y:200}, {c:'L', x:6, y:200}, {c:'Z'},
            {c:'M', x:88, y:135}, {c:'L', x:68, y:37}, {c:'L', x:49, y:135}, {c:'L', x:88, y:135}, {c:'Z'}
        ],
        '2': [
            {c:'M', x:10, y:200}, {c:'L', x:11, y:187}, {c:'C', x1:15, y1:149, x2:23, y2:136, x:70, y:97}, {c:'C', x1:93, y1:78, x2:100, y2:68, x:101, y:57}, {c:'C', x1:104, y1:31, x2:81, y2:23, x:65, y:23}, {c:'C', x1:46, y1:22, x2:23, y2:34, x:35, y:62}, {c:'L', x:12, y:68}, {c:'C', x1:8, y1:43, x2:12, y2:18, x:33, y:8}, {c:'C', x1:61, y1:-6, x2:96, y2:-1, x:115, y:21}, {c:'C', x1:127, y1:36, x2:129, y2:56, x:123, y:72}, {c:'C', x1:104, y1:113, x2:39, y2:131, x:35, y:179}, {c:'L', x:105, y:179}, {c:'L', x:105, y:152}, {c:'L', x:127, y:152}, {c:'L', x:127, y:200}, {c:'L', x:10, y:200}, {c:'Z'}
        ],
        '3': [
            {c:'M', x:2, y:156}, {c:'L', x:18, y:145}, {c:'C', x1:31, y1:167, x2:47, y2:181, x:70, y:178}, {c:'C', x1:104, y1:176, x2:119, y2:140, x:112, y:113}, {c:'C', x1:105, y1:89, x2:76, y2:77, x:53, y:90}, {c:'C', x1:47, y1:93, x2:43, y2:96, x:41, y:96}, {c:'C', x1:39, y1:96, x2:33, y2:85, x:34, y:82}, {c:'C', x1:50, y1:59, x2:87, y2:21, x:87, y:21}, {c:'L', x:28, y:21}, {c:'L', x:28, y:47}, {c:'L', x:6, y:47}, {c:'L', x:6, y:0}, {c:'L', x:120, y:0}, {c:'L', x:120, y:16}, {c:'C', x1:120, y1:16, x2:90, y2:48, x:80, y:64}, {c:'C', x1:104, y1:65, x2:125, y2:81, x:132, y:105}, {c:'C', x1:136, y1:118, x2:135, y2:148, x:129, y:160}, {c:'C', x1:119, y1:182, x2:94, y2:199, x:71, y:200}, {c:'C', x1:33, y1:202, x2:12, y2:176, x:2, y:156}, {c:'Z'}
        ],
        '4': [
            {c:'M', x:70, y:200}, {c:'L', x:70, y:183}, {c:'L', x:86, y:183}, {c:'L', x:86, y:153}, {c:'L', x:5, y:153}, {c:'L', x:5, y:133}, {c:'L', x:93, y:0}, {c:'L', x:107, y:0}, {c:'L', x:107, y:133}, {c:'L', x:132, y:133}, {c:'L', x:132, y:153}, {c:'L', x:107, y:153}, {c:'L', x:107, y:183}, {c:'L', x:120, y:183}, {c:'L', x:120, y:200}, {c:'Z'},
            {c:'M', x:86, y:49}, {c:'L', x:30, y:133}, {c:'L', x:86, y:133}, {c:'Z'}
        ],
        '5': [
            {c:'M', x:4, y:148}, {c:'L', x:24, y:148}, {c:'C', x1:28, y1:160, x2:37, y2:173, x:48, y:176}, {c:'C', x1:80, y1:183, x2:101, y2:166, x:108, y:144}, {c:'C', x1:116, y1:120, x2:107, y2:84, x:85, y:71}, {c:'C', x1:67, y1:61, x2:40, y2:70, x:27, y:92}, {c:'L', x:13, y:83}, {c:'L', x:20, y:0}, {c:'L', x:112, y:0}, {c:'L', x:112, y:20}, {c:'L', x:37, y:20}, {c:'L', x:37, y:55}, {c:'C', x1:52, y1:44, x2:77, y2:44, x:93, y:52}, {c:'C', x1:123, y1:66, x2:137, y2:98, x:131, y:137}, {c:'C', x1:123, y1:175, x2:105, y2:197, x:64, y:200}, {c:'C', x1:20, y1:201, x2:4, y2:170, x:4, y:148}, {c:'Z'}
        ],
        '6': [
            {c:'M', x:8, y:139}, {c:'C', x1:6, y1:122, x2:6, y2:78, x:8, y:65}, {c:'C', x1:15, y1:26, x2:30, y2:7, x:55, y:2}, {c:'C', x1:81, y1:-4, x2:116, y2:3, x:124, y:35}, {c:'L', x:103, y:36}, {c:'C', x1:91, y1:14, x2:60, y2:15, x:46, y:29}, {c:'C', x1:34, y1:37, x2:28, y2:68, x:30, y:70}, {c:'C', x1:30, y1:70, x2:50, y2:55, x:73, y:55}, {c:'C', x1:120, y1:55, x2:132, y2:94, x:130, y:127}, {c:'C', x1:129, y1:167, x2:116, y2:198, x:73, y:200}, {c:'C', x1:31, y1:198, x2:12, y2:177, x:8, y:139}, {c:'Z'},
            {c:'M', x:110, y:128}, {c:'C', x1:111, y1:101, x2:98, y2:80, x:73, y:77}, {c:'C', x1:50, y1:76, x2:26, y2:99, x:27, y:127}, {c:'C', x1:29, y1:155, x2:40, y2:179, x:69, y:179}, {c:'C', x1:101, y1:179, x2:110, y2:147, x:110, y:128}, {c:'Z'}
        ],
        '7': [
            {c:'M', x:37, y:200}, {c:'C', x1:50, y1:131, x2:65, y2:79, x:102, y:22}, {c:'L', x:26, y:22}, {c:'L', x:26, y:46}, {c:'L', x:6, y:46}, {c:'L', x:6, y:0}, {c:'L', x:117, y:0}, {c:'L', x:131, y:22}, {c:'C', x1:91, y1:64, x2:54, y2:202, x:61, y:200}, {c:'L', x:37, y:200}, {c:'Z'}
        ],
        '8': [
            {c:'M', x:2, y:142}, {c:'C', x1:3, y1:115, x2:13, y2:105, x:32, y:90}, {c:'C', x1:17, y1:79, x2:10, y2:63, x:12, y:50}, {c:'C', x1:15, y1:17, x2:41, y2:0, x:69, y:0}, {c:'C', x1:98, y1:1, x2:123, y2:24, x:125, y:48}, {c:'C', x1:127, y1:69, x2:120, y2:79, x:105, y:90}, {c:'C', x1:123, y1:105, x2:135, y2:115, x:135, y:141}, {c:'C', x1:134, y1:168, x2:111, y2:199, x:71, y:200}, {c:'C', x1:31, y1:201, x2:1, y2:168, x:2, y:142}, {c:'Z'},
            {c:'M', x:113, y:142}, {c:'C', x1:115, y1:117, x2:93, y2:101, x:69, y:101}, {c:'C', x1:45, y1:101, x2:23, y2:121, x:23, y:143}, {c:'C', x1:23, y1:166, x2:51, y2:178, x:69, y:178}, {c:'C', x1:91, y1:178, x2:112, y2:163, x:113, y:142}, {c:'Z'},
            {c:'M', x:105, y:55}, {c:'C', x1:106, y1:34, x2:87, y2:20, x:67, y:21}, {c:'C', x1:50, y1:21, x2:31, y2:34, x:31, y:51}, {c:'C', x1:31, y1:72, x2:52, y2:83, x:70, y:83}, {c:'C', x1:86, y1:84, x2:105, y2:71, x:105, y:55}, {c:'Z'}
        ],
        '9': [
            {c:'M', x:11, y:161}, {c:'L', x:30, y:156}, {c:'C', x1:37, y1:174, x2:52, y2:180, x:67, y:178}, {c:'C', x1:94, y1:176, x2:102, y2:146, x:104, y:120}, {c:'C', x1:94, y1:131, x2:78, y2:137, x:64, y:136}, {c:'C', x1:21, y1:134, x2:10, y2:100, x:10, y:65}, {c:'C', x1:9, y1:35, x2:21, y2:13, x:43, y:3}, {c:'C', x1:55, y1:-1, x2:81, y2:-1, x:92, y:4}, {c:'C', x1:118, y1:18, x2:128, y2:42, x:126, y:98}, {c:'C', x1:126, y1:144, x2:117, y2:198, x:66, y:200}, {c:'C', x1:36, y1:204, x2:14, y2:181, x:11, y:161}, {c:'Z'},
            {c:'M', x:85, y:111}, {c:'C', x1:94, y1:105, x2:98, y2:100, x:102, y:92}, {c:'C', x1:106, y1:86, x2:106, y2:83, x:106, y:69}, {c:'C', x1:103, y1:36, x2:86, y2:17, x:60, y:21}, {c:'C', x1:44, y1:23, x2:36, y2:31, x:33, y:46}, {c:'C', x1:24, y1:73, x2:35, y2:105, x:55, y:112}, {c:'C', x1:63, y1:116, x2:78, y2:115, x:85, y:111}, {c:'Z'}
        ],
        '0': [
            {c:'M', x:6, y:200}, {c:'L', x:6, y:0}, {c:'L', x:26, y:0}, {c:'L', x:26, y:200}, {c:'L', x:6, y:200}, {c:'M', x:85, y:0}, {c:'C', x1:66, y1:0, x2:50, y2:17, x:50, y:39}, {c:'L', x:50, y:162}, {c:'C', x1:50, y1:183, x2:66, y2:200, x:85, y:200}, {c:'L', x:96, y:200}, {c:'C', x1:115, y1:200, x2:130, y2:183, x:130, y:162}, {c:'L', x:130, y:39}, {c:'C', x1:130, y1:17, x2:115, y2:0, x:96, y:0}, {c:'L', x:85, y:0}, {c:'M', x:90, y:19}, {c:'C', x1:102, y1:19, x2:110, y2:28, x:110, y:38}, {c:'L', x:110, y:163}, {c:'C', x1:110, y1:174, x2:102, y2:183, x:90, y:183}, {c:'C', x1:79, y1:183, x2:70, y2:174, x:70, y:163}, {c:'L', x:70, y:38}, {c:'C', x1:70, y1:28, x2:79, y2:19, x:90, y:19}, {c:'Z'}
        ],
        'j': [
            {c:'M', x:68, y:0}, {c:'L', x:68, y:21}, {c:'L', x:88, y:21}, {c:'C', x1:88, y1:21, x2:89, y2:41, x:89, y:84}, {c:'C', x1:89, y1:126, x2:90, y2:146, x:88, y:158}, {c:'C', x1:81, y1:185, x2:40, y2:185, x:32, y:166}, {c:'C', x1:27, y1:155, x2:28, y2:146, x:28, y:134}, {c:'L', x:6, y:134}, {c:'C', x1:6, y1:134, x2:6, y2:140, x:6, y:147}, {c:'C', x1:6, y1:178, x2:17, y2:193, x:41, y:198}, {c:'C', x1:65, y1:204, x2:95, y2:194, x:105, y:174}, {c:'C', x1:111, y1:162, x2:111, y2:161, x:111, y:89}, {c:'C', x1:111, y1:41, x2:111, y2:21, x:111, y:21}, {c:'L', x:130, y:21}, {c:'L', x:130, y:0}, {c:'L', x:68, y:0}, {c:'Z'}
        ],
        'q': [
            {c:'M', x:24, y:134}, {c:'L', x:6, y:134}, {c:'L', x:6, y:112}, {c:'L', x:24, y:112}, {c:'C', x1:24, y1:112, x2:24, y2:60, x:24, y:40}, {c:'C', x1:24, y1:18, x2:40, y2:0, x:66, y:0}, {c:'C', x1:92, y1:0, x2:110, y2:18, x:110, y:40}, {c:'C', x1:110, y1:62, x2:111, y2:148, x:110, y:155}, {c:'C', x1:110, y1:168, x2:108, y2:170, x:108, y:171}, {c:'C', x1:110, y1:176, x2:130, y2:178, x:130, y:177}, {c:'L', x:130, y:199}, {c:'C', x1:115, y1:201, x2:109, y2:199, x:96, y:190}, {c:'C', x1:88, y1:198, x2:65, y2:205, x:46, y:196}, {c:'C', x1:32, y1:190, x2:24, y2:174, x:24, y:134}, {c:'Z'},
            {c:'M', x:81, y:174}, {c:'C', x1:73, y1:162, x2:58, y2:145, x:44, y:140}, {c:'C', x1:44, y1:156, x2:46, y2:165, x:51, y:171}, {c:'C', x1:59, y1:181, x2:71, y2:183, x:81, y:174}, {c:'Z'},
            {c:'M', x:66, y:22}, {c:'C', x1:50, y1:22, x2:44, y2:30, x:44, y:70}, {c:'C', x1:44, y1:94, x2:44, y2:116, x:44, y:116}, {c:'C', x1:67, y1:123, x2:90, y2:150, x:90, y:150}, {c:'L', x:90, y:70}, {c:'C', x1:90, y1:30, x2:82, y2:22, x:66, y:22}, {c:'Z'}
        ],
        'k': [
            {c:'M', x:76, y:180}, {c:'L', x:96, y:180}, {c:'L', x:64, y:106}, {c:'L', x:40, y:142}, {c:'L', x:40, y:180}, {c:'L', x:56, y:180}, {c:'L', x:56, y:200}, {c:'L', x:0, y:200}, {c:'L', x:0, y:180}, {c:'L', x:20, y:180}, {c:'L', x:20, y:20}, {c:'L', x:0, y:20}, {c:'L', x:0, y:0}, {c:'L', x:56, y:0}, {c:'L', x:56, y:20}, {c:'L', x:40, y:20}, {c:'L', x:40, y:100}, {c:'L', x:92.0636, y:19.841}, {c:'L', x:76, y:20}, {c:'L', x:76, y:0}, {c:'L', x:136, y:0}, {c:'L', x:136, y:20}, {c:'L', x:120, y:20}, {c:'L', x:76, y:88}, {c:'L', x:116, y:180}, {c:'L', x:136, y:180}, {c:'L', x:136, y:200}, {c:'L', x:76, y:200}, {c:'Z'}
        ],
        'o': [
            {c:'M', x:141, y:0}, {c:'L', x:181, y:0}, {c:'C', x1:168, y1:55, x2:161, y2:150, x:129, y:183}, {c:'C', x1:91, y1:219, x2:15, y2:198, x:21, y:141}, {c:'L', x:60, y:137}, {c:'C', x1:58, y1:157, x2:62, y2:166, x:81, y:166}, {c:'C', x1:102, y1:165, x2:110, y2:143, x:115, y:118}, {c:'M', x:6, y:378}, {c:'C', x1:6, y1:306, x2:53, y2:256, x:119, y:256}, {c:'C', x1:197, y1:256, x2:213, y2:346, x:187, y:398}, {c:'C', x1:164, y1:438, x2:130, y2:458, x:88, y:459}, {c:'C', x1:39, y1:458, x2:7, y1:422, x:6, y:378}, {c:'M', x:47, y:377}, {c:'C', x1:49, y1:406, x2:67, y2:425, x:93, y:425}, {c:'C', x1:168, y1:423, x2:182, y2:292, x:115, y:290}, {c:'C', x1:69, y1:294, x2:47, y2:338, x:47, y:377}, {c:'M', x:0, y:714}, {c:'L', x:42, y:518}, {c:'L', x:84, y:518}, {c:'L', x:66, y:601}, {c:'L', x:159, y:518}, {c:'L', x:215, y:518}, {c:'L', x:124, y:595}, {c:'L', x:191, y:714}, {c:'L', x:144, y:714}, {c:'L', x:94, y:621}, {c:'L', x:55, y:654}, {c:'L', x:42, y:714}, {c:'M', x:8, y:973}, {c:'L', x:50, y:777}, {c:'L', x:200, y:777}, {c:'L', x:193, y:809}, {c:'L', x:85, y:809}, {c:'L', x:75, y:854}, {c:'L', x:180, y:854}, {c:'L', x:173, y:887}, {c:'L', x:68, y:887}, {c:'L', x:56, y:940}, {c:'L', x:173, y:940}, {c:'L', x:166, y:973}, {c:'M', x:43, y:1231}, {c:'L', x:1, y:1231}, {c:'L', x:44, y:1035}, {c:'L', x:133, y:1035}, {c:'C', x1:170, y1:1037, x2:197, y2:1051, x:198, y:1087}, {c:'C', x1:195, y1:1127, x2:169, y2:1143, x:136, y:1148}, {c:'C', x1:158, y1:1171, x2:171, y2:1206, x:182, y:1231}, {c:'L', x:137, y:1231}, {c:'C', x1:116, y1:1182, x2:112, y2:1150, x:60, y:1150}, {c:'M', x:67, y:1121}, {c:'C', x1:96, y1:1121, x2:155, y2:1126, x:156, y:1087}, {c:'C', x1:151, y1:1061, x2:100, y2:1068, x:78, y:1068}, {c:'Z'}
        ],
        'h': [
            {c:'M', x:100, y:30}, {c:'C', x1:60, y1:7, x2:0, y2:7, x:0, y:76}, {c:'C', x1:0, y1:131, x2:100, y2:190, x:100, y:190}, {c:'C', x1:100, y1:190, x2:200, y2:131, x:200, y:76}, {c:'C', x1:200, y1:7, x2:140, y2:7, x:100, y:30}, {c:'Z'}
        ],
        'd': [
            {c:'M', x:184, y:100}, {c:'C', x1:152, y1:120, x2:120, y2:160, x:100, y:200}, {c:'C', x1:80, y1:160, x2:48, y2:120, x:16, y:100}, {c:'C', x1:48, y1:80, x2:80, y2:40, x:100, y:0}, {c:'C', x1:120, y1:40, x2:152, y1:80, x:184, y:100}, {c:'Z'}
        ],
        's': [
            {c:'M', x:200, y:120}, {c:'C', x1:200, y1:168, x2:144, y2:176, x:116, y:156}, {c:'C', x1:116, y1:180, x2:116, y2:188, x:128, y:200}, {c:'C', x1:112, y1:196, x2:88, y2:196, x:72, y:200}, {c:'C', x1:84, y1:188, x2:84, y2:180, x:84, y:156}, {c:'C', x1:56, y1:176, x2:0, y2:168, x:0, y:120}, {c:'C', x1:0, y1:72, x2:60, y1:36, x:100, y:0}, {c:'C', x1:140, y1:36, x2:200, y2:72, x:200, y:120}, {c:'Z'}
        ],
        'c': [
            {c:'M', x:80, y:200}, {c:'C', x1:92, y1:184, x2:92, y2:160, x:92, y:136}, {c:'C', x1:76, y1:180, x2:0, y2:176, x:0, y:124}, {c:'C', x1:0, y1:80, x2:40, y1:76, x:68, y:88}, {c:'C', x1:80, y1:92, x2:80, y2:88, x:72, y:84}, {c:'C', x1:44, y1:64, x2:40, y2:0, x:100, y:0}, {c:'C', x1:160, y1:0, x2:156, y2:64, x:128, y:84}, {c:'C', x1:120, y1:88, x2:120, y2:92, x:132, y:88}, {c:'C', x1:160, y1:76, x2:200, y2:80, x:200, y:124}, {c:'C', x1:200, y1:176, x2:124, y2:180, x:108, y:136}, {c:'C', x1:108, y1:160, x2:108, y2:184, x:120, y:200}, {c:'C', x1:100, y1:196, x2:100, y2:196, x:80, y:200}, {c:'Z'}
        ],
        'r': [
            {c:'M', x:44, y:60}, {c:'C', x1:45, y1:56, x2:-3, y2:33, x:0, y:70}, {c:'C', x1:2, y1:107, x2:39, y2:146, x:48, y:150}, {c:'C', x1:57, y1:154, x2:12, y2:107, x:12, y:77}, {c:'C', x1:12, y1:45, x2:43, y2:65, x:44, y:60}, {c:'M', x:37, y:65}, {c:'C', x1:31, y1:64, x2:20, y2:60, x:19, y:81}, {c:'C', x1:19, y1:100, x2:63, y2:158, x:65, y:149}, {c:'C', x1:65, y1:139, x2:33, y2:102, x:37, y:65}, {c:'M', x:86, y:56}, {c:'C', x1:87, y1:52, x2:38, y2:28, x:40, y:66}, {c:'C', x1:43, y1:103, x2:69, y2:141, x:78, y:148}, {c:'C', x1:86, y1:155, x2:54, y2:102, x:54, y:71}, {c:'C', x1:54, y1:39, x2:86, y2:60, x:86, y:56}, {c:'M', x:82, y:65}, {c:'C', x1:77, y1:64, x2:59, y2:54, x:59, y:74}, {c:'C', x1:60, y1:95, x2:82, y2:146, x:84, y:138}, {c:'C', x1:86, y1:132, x2:78, y2:102, x:82, y:65}, {c:'M', x:154, y:60}, {c:'C', x1:153, y1:56, x2:203, y2:33, x:200, y:70}, {c:'C', x1:197, y1:107, x2:159, y2:146, x:151, y:150}, {c:'C', x1:142, y1:154, x2:187, y2:107, x:187, y:77}, {c:'C', x1:187, y1:45, x2:155, y2:65, x:154, y:60}, {c:'M', x:161, y:65}, {c:'C', x1:167, y1:64, x2:179, y2:60, x:180, y:81}, {c:'C', x1:181, y1:100, x2:137, y2:158, x:135, y:149}, {c:'C', x1:134, y1:139, x2:165, y2:102, x:161, y:65}, {c:'M', x:113, y:56}, {c:'C', x1:112, y1:52, x2:161, y2:28, x:158, y:66}, {c:'C', x1:155, y1:103, x2:130, y2:141, x:122, y:148}, {c:'C', x1:114, y1:155, x2:145, y2:102, x:145, y:71}, {c:'C', x1:145, y1:39, x2:114, y2:60, x:113, y:56}, {c:'M', x:117, y:65}, {c:'C', x1:123, y1:64, x2:141, y2:54, x:141, y:74}, {c:'C', x1:140, y1:95, x2:118, y2:146, x:116, y:138}, {c:'C', x1:114, y1:132, x2:121, y2:102, x:117, y:65}, {c:'Z'}
        ]
    };

    // Helper functions (formerly fixSuit, fixSymbol)
    function standardizeSuit(inputString) {
        return (inputString || 'h').substring(0, 1).toLowerCase();
    }

    function standardizeRank(inputString) {
        inputString = (inputString || 'o').toString().toLowerCase();
        // The original logic `(symbol.match(/jo|10|cr/)) ? 1 : 0` is tricky.
        // It takes the second character for 'jo', '10', 'cr', otherwise the first.
        // For 'jo' it means 'o', for '10' it means '0', for 'cr' it means 'r'.
        if (inputString.startsWith('jo')) return 'o';
        if (inputString.startsWith('10')) return '0';
        if (inputString.startsWith('cr')) return 'r';
        return inputString.substring(0, 1);
    }

    // New class encapsulating drawing logic, replacing direct prototype extension
    class ShapeRenderer {
        constructor(drawingContext) {
            this.ctx = drawingContext;
        }

        // Helper to scale coordinates, replacing ax, ay, as
        scaleCoordinate(baseOffset, originalValue, targetDimension, referenceDimension = 200) {
            return baseOffset + originalValue * (targetDimension / referenceDimension);
        }

        // Helper to scale dimensions
        scaleDimension(originalDimension, targetDimension, referenceDimension = 200) {
            return originalDimension * (targetDimension / referenceDimension);
        }

        // New version of svgCurve (traceVectorShape) - uses pre-parsed data
        traceVectorShape(originX, originY, targetSize, pathSegments) {
            this.ctx.beginPath();
            for (const segment of pathSegments) {
                const sx = (val) => this.scaleCoordinate(originX, val, targetSize);
                const sy = (val) => this.scaleCoordinate(originY, val, targetSize);

                switch (segment.c) {
                    case 'M':
                        this.ctx.moveTo(sx(segment.x), sy(segment.y));
                        break;
                    case 'L':
                        this.ctx.lineTo(sx(segment.x), sy(segment.y));
                        break;
                    case 'C':
                        this.ctx.bezierCurveTo(
                            sx(segment.x1), sy(segment.y1),
                            sx(segment.x2), sy(segment.y2),
                            sx(segment.x), sy(segment.y)
                        );
                        break;
                    case 'Q':
                        this.ctx.quadraticCurveTo(
                            sx(segment.x1), sy(segment.y1),
                            sx(segment.x), sy(segment.y)
                        );
                        break;
                    case 'Z':
                        this.ctx.closePath();
                        break;
                }
            }
        }

        // New version of roundRect (craftRoundedRectangle)
        craftRoundedRectangle(originX, originY, rectWidth, rectHeight, cornerRadius, inwardFlag) {
            this.ctx.beginPath();
            if (!inwardFlag) {
                this.ctx.moveTo(originX + cornerRadius, originY);
                this.ctx.lineTo(originX + rectWidth - cornerRadius, originY);
                this.ctx.arc(originX + rectWidth - cornerRadius, originY + cornerRadius, cornerRadius, (Math.PI / 180) * 270, 0);
                this.ctx.lineTo(originX + rectWidth, originY + rectHeight - cornerRadius);
                this.ctx.arc(originX + rectWidth - cornerRadius, originY + rectHeight - cornerRadius, cornerRadius, 0, (Math.PI / 2));
                this.ctx.lineTo(originX + cornerRadius, originY + rectHeight);
                this.ctx.arc(originX + cornerRadius, originY + rectHeight - cornerRadius, cornerRadius, (Math.PI / 2), Math.PI);
                this.ctx.lineTo(originX, originY + cornerRadius);
                this.ctx.arc(originX + cornerRadius, originY + cornerRadius, cornerRadius, Math.PI, (Math.PI / 180) * 270);
            } else {
                this.ctx.moveTo(originX, originY + cornerRadius);
                this.ctx.lineTo(originX, originY + rectHeight - cornerRadius);
                this.ctx.arc(originX, originY + rectHeight, cornerRadius, (Math.PI / 180) * 270, 0);
                this.ctx.lineTo(originX + rectWidth - cornerRadius, originY + rectHeight);
                this.ctx.arc(originX + rectWidth, originY + rectHeight, cornerRadius, Math.PI, (Math.PI / 180) * 270);
                this.ctx.lineTo(originX + rectWidth, originY + cornerRadius);
                this.ctx.arc(originX + rectWidth, originY, cornerRadius, Math.PI / 2, Math.PI);
                this.ctx.lineTo(originX + cornerRadius, originY);
                this.ctx.arc(originX, originY, cornerRadius, 0, Math.PI / 2);
            }
            this.ctx.closePath();
        }

        outlineRoundedRectangle(originX, originY, rectWidth, rectHeight, cornerRadius, inwardFlag) {
            this.craftRoundedRectangle(originX + 0.5, originY + 0.5, rectWidth - 1, rectHeight - 1, cornerRadius, inwardFlag);
            this.ctx.stroke();
        }

        shadeRoundedRectangle(originX, originY, rectWidth, rectHeight, cornerRadius, inwardFlag) {
            this.craftRoundedRectangle(originX, originY, rectWidth, rectHeight, cornerRadius, inwardFlag);
            this.ctx.fill();
        }

        drawDesignElement(originX, originY, targetSize, elementIdentifier) {
            elementIdentifier = standardizeRank(elementIdentifier);
            if (iconDataRegistry[elementIdentifier]) {
                this.traceVectorShape(originX, originY, targetSize, iconDataRegistry[elementIdentifier]);
            }
        }

        outlineDesignElement(originX, originY, targetSize, elementIdentifier) {
            this.drawDesignElement(originX + 0.5, originY + 0.5, targetSize - 1, elementIdentifier);
            this.ctx.stroke();
        }

        shadeDesignElement(originX, originY, targetSize, elementIdentifier) {
            this.drawDesignElement(originX, originY, targetSize, elementIdentifier);
            this.ctx.fill();
        }

        renderRoyalEmblem(originX, originY, targetSize, lightColor, darkColor, gemColor) {
            const sx = (val) => this.scaleCoordinate(originX, val, targetSize);
            const sy = (val) => this.scaleCoordinate(originY, val, targetSize);
            const sd = (val) => this.scaleDimension(val, targetSize);

            lightColor = lightColor || '#fdf98b';
            darkColor = darkColor || '#e7bd4f';
            gemColor = gemColor || '#fff';

            const gradientFill = this.ctx.createLinearGradient(sx(5), sy(5), sx(100), sy(200));
            gradientFill.addColorStop(0, lightColor);
            gradientFill.addColorStop(1, darkColor);

            this.ctx.fillStyle = gradientFill;
            this.shadeDesignElement(sx(0), sy(0), sd(200), 'r');
            this.shadeRoundedRectangle(sx(88), sy(42), sd(23), sd(110), sd(12));
            this.shadeDesignElement(sx(86), sy(18), sd(27), 's');
            this.shadeRoundedRectangle(sx(40), sy(150), sd(120), sd(24), sd(10));
            this.ctx.fillStyle = gemColor;
            this.shadeDesignElement(sx(92), sy(26), sd(15), 'd');
            this.shadeDesignElement(sx(93), sy(60), sd(13), 'h');
            this.shadeDesignElement(sx(93), sy(80), sd(13), 'h');
            this.shadeDesignElement(sx(93), sy(100), sd(13), 'h');
            this.shadeDesignElement(sx(93), sy(120), sd(13), 'h');
            this.shadeDesignElement(sx(93), sy(155), sd(13), 'h');
            this.shadeDesignElement(sx(73), sy(155), sd(13), 'h');
            this.shadeDesignElement(sx(53), sy(155), sd(13), 'h');
            this.shadeDesignElement(sx(113), sy(155), sd(13), 'h');
            this.shadeDesignElement(sx(133), sy(155), sd(13), 'h');
        }

        renderBasePanel(originX, originY, targetSize) {
            const sx = (val) => this.scaleCoordinate(originX, val, targetSize);
            const sy = (val) => this.scaleCoordinate(originY, val, targetSize);
            const sd = (val) => this.scaleDimension(val, targetSize);

            const gradientFill = this.ctx.createLinearGradient(sx(5), sy(5), sx(55), sy(200));
            gradientFill.addColorStop(0, '#fff');
            gradientFill.addColorStop(1, '#e0e0e0');

            this.ctx.fillStyle = gradientFill;
            this.shadeRoundedRectangle(sx(0), sy(0), sd(150), sd(200), sd(16));
            this.ctx.strokeStyle = '#666';
            this.outlineRoundedRectangle(sx(0), sy(0), sd(150), sd(200), sd(16));
        }

        depictPlayingCard(originX, originY, targetSize, cardSuit, cardRank) {
            const sx = (val) => this.scaleCoordinate(originX, val, targetSize);
            const sy = (val) => this.scaleCoordinate(originY, val, targetSize);
            const sd = (val) => this.scaleDimension(val, targetSize);

            cardSuit = standardizeSuit(cardSuit);
            cardRank = standardizeRank(cardRank);

            this.renderBasePanel(sx(0), sy(0), sd(200));
            this.ctx.fillStyle = (cardSuit === 'h' || cardSuit === 'd') ? '#a22' : '#000';

            if (targetSize >= 100) {
                if (cardRank !== 'o') {
                    this.shadeDesignElement(sx(40), sy(65), sd(70), cardSuit);
                    this.shadeDesignElement(sx(10), sy(10), sd(40), cardRank);
                    this.shadeDesignElement(sx(11), sy(55), sd(25), cardSuit);
                    this.shadeDesignElement(sx(140), sy(190), sd(-40), cardRank);
                    this.shadeDesignElement(sx(139), sy(145), sd(-25), cardSuit);
                } else {
                    this.shadeDesignElement(sx(11), sy(10), sd(18), 'o');
                    this.shadeDesignElement(sx(139), sy(190), sd(-18), 'o');
                    if (cardSuit === 'h' || cardSuit === 'd') {
                        this.renderRoyalEmblem(sx(38), sy(63), sd(74), '#b55', '#a22');
                        this.renderRoyalEmblem(sx(40), sy(65), sd(70), '#fdf98b', '#e7bd4f', '#a22');
                    } else {
                        this.renderRoyalEmblem(sx(38), sy(63), sd(74), '#000', '#000');
                        this.renderRoyalEmblem(sx(40), sy(65), sd(70), '#eee', '#888', '#333');
                    }
                }
            } else {
                if (cardRank !== 'o') {
                    this.shadeDesignElement(sx(30), sy(75), sd(100), cardSuit);
                    this.shadeDesignElement(sx(15), sy(15), sd(50), cardRank);
                } else {
                    this.shadeDesignElement(sx(11), sy(10), sd(22), 'o');
                    if (cardSuit === 'h' || cardSuit === 'd') {
                        this.renderRoyalEmblem(sx(45), sy(73), sd(89), '#b55', '#a22');
                        this.renderRoyalEmblem(sx(47), sy(75), sd(85), '#fdf98b', '#e7bd4f', '#a22');
                    } else {
                        this.renderRoyalEmblem(sx(45), sy(73), sd(89), '#000', '#000');
                        this.renderRoyalEmblem(sx(47), sy(75), sd(85), '#eee', '#888', '#333');
                    }
                }
            }
        }

        depictCardRear(originX, originY, targetSize, foreTint, backTint) {
            const sx = (val) => this.scaleCoordinate(originX, val, targetSize);
            const sy = (val) => this.scaleCoordinate(originY, val, targetSize);
            const sd = (val) => this.scaleDimension(val, targetSize);

            foreTint = foreTint || '#b55';
            backTint = backTint || '#a22';

            this.renderBasePanel(originX, originY, targetSize);

            this.ctx.fillStyle = backTint;
            this.shadeRoundedRectangle(sx(10), sy(10), sd(130), sd(180), sd(8));
            this.ctx.strokeStyle = foreTint;
            this.outlineRoundedRectangle(sx(18), sy(18), sd(114), sd(164), sd(4));
            this.ctx.fillStyle = foreTint;
            this.shadeRoundedRectangle(sx(26), sy(26), sd(96), sd(148), sd(24), true);

            this.shadeDesignElement(sx(24), sy(24), sd(20), 's');
            this.shadeDesignElement(sx(106), sy(24), sd(20), 's');
            this.shadeDesignElement(sx(44), sy(176), sd(-20), 's');
            this.shadeDesignElement(sx(126), sy(176), sd(-20), 's');
            this.ctx.fillStyle = backTint;
            this.shadeRoundedRectangle(sx(50), sy(40), sd(50), sd(120), sd(24));
            this.shadeDesignElement(sx(32), sy(54), sd(86), 's');
            this.shadeDesignElement(sx(30), sy(60), sd(16), 's');
            this.shadeDesignElement(sx(104), sy(60), sd(16), 's');
            this.shadeDesignElement(sx(30), sy(128), sd(16), 's');
            this.shadeDesignElement(sx(104), sy(128), sd(16), 's');
            this.outlineDesignElement(sx(31), sy(53), sd(88), 's');
            this.ctx.fillStyle = foreTint;

            this.shadeDesignElement(sx(50), sy(75), sd(50), 'c');
        }
    }

    // Global utility object, replacing the original `Poker` object
    window.PlayingCardUtility = {
        // Helper to create a canvas of the correct size, replacing pc
        createPanel: function(cardHeight) {
            const newCanvas = document.createElement('canvas');
            newCanvas.height = cardHeight;
            newCanvas.width = cardHeight * 3 / 4;
            return newCanvas;
        },

        fetchVisualRepresentation: function(cardHeight, cardSuit, cardRank) {
            const visualElem = document.createElement('img');
            visualElem.src = this.retrieveImageDataURI(cardHeight, cardSuit, cardRank);
            return visualElem;
        },

        generateCanvasElement: function(cardHeight, cardSuit, cardRank) {
            const outputCanvas = this.createPanel(cardHeight);
            const contextObj = new ShapeRenderer(outputCanvas.getContext('2d'));
            contextObj.depictPlayingCard(0, 0, cardHeight, cardSuit, cardRank);
            return outputCanvas;
        },

        retrieveImageDataURI: function(cardHeight, cardSuit, cardRank) {
            return this.generateCanvasElement(cardHeight, cardSuit, cardRank).toDataURL();
        },

        fetchRearVisual: function(cardHeight, foreTint, backTint) {
            const visualElem = document.createElement('img');
            visualElem.src = this.retrieveRearImageDataURI(cardHeight, foreTint, backTint);
            return visualElem;
        },

        generateRearCanvasElement: function(cardHeight, foreTint, backTint) {
            const outputCanvas = this.createPanel(cardHeight);
            const contextObj = new ShapeRenderer(outputCanvas.getContext('2d'));
            contextObj.depictCardRear(0, 0, cardHeight, foreTint, backTint);
            return outputCanvas;
        },

        retrieveRearImageDataURI: function(cardHeight, foreTint, backTint) {
            return this.generateRearCanvasElement(cardHeight, foreTint, backTint).toDataURL();
        }
    };
}