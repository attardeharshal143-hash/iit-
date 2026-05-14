export type Language = "en-IN" | "hi-IN" | "mr-IN" | "kn-IN" | "bn-IN" | "gu-IN" | "ta-IN" | "te-IN";

export const translations: Record<Language, any> = {
  "en-IN": {
    nav: { finebook: "Finebook", languages: "Languages", askAi: "Ask AI", startDriving: "Start Driving" },
    hero: { tag: "AI Road Intelligence Active", title: "Drive Smarter. Stay Legal", desc: "The world's first AI-powered road compliance engine. Real-time legal alerts, global fine database, and proactive speed guidance powered by Llama 3.1." },
    features: {
      tag: "THE PLATFORM", title: "Four engines. One co-pilot", desc: "LexDrive combines a real-time legal advisor, a global fine database, a proactive speed monitor, and a multilingual voice interface — all working together to keep you compliant on every road.",
      cards: [
        { title: "Llama 3.1 Intelligence", desc: "Voice-activated legal Q&A with sub-second responses via Groq." },
        { title: "Web Bluetooth Speed", desc: "Connect directly to your car's ECU via ELM327 BLE." },
        { title: "Proactive Voice Alerts", desc: "Automated alerts for overspeeding, aggressive driving, and more." },
        { title: "OSM Road Detection", desc: "Detects schools, hospitals, and cameras within 300m." },
        { title: "Live Weather Safety", desc: "Wet road warnings and visibility alerts based on real-time weather." },
        { title: "Global Legal Database", desc: "115+ violations across 6 countries with natural language filtering." }
      ]
    },
    pipeline: { tag: "SYSTEM ARCHITECTURE", title: "The LexDrive Pipeline", steps: [{ title: "Data Collection", desc: "GPS & OBD-II stream speed." }, { title: "Intelligence Layer", desc: "Evaluates behavior against local traffic laws." }, { title: "Proactive Warning", desc: "Synthesizes voice alerts before violations." }, { title: "Voice UI", desc: "Ask the 3D Robot questions & get answers." }] },
    copilotCard: { tag: "Flagship Module", title: "Meet your AI Co-Pilot", desc: "Fully interactive 3D companion powered by Groq Llama 3.1. Ask legal questions by voice, get instant answers in 4 languages, and receive proactive driving alerts.", badges: ["Voice + Text", "4 Languages", "<1s Response"] },
    howItWorks: { tag: "HOW IT WORKS", title: "From question to clarity in three steps", steps: [{ title: "Ask or Drive", desc: "Type your question or just start driving." }, { title: "Get Instant Answers", desc: "Receive precise legal answers with cited sources." }, { title: "Stay Compliant", desc: "Drive with confidence knowing LexDrive is monitoring laws." }] },
    speedAdvisor: { tag: "SPEED ADVISOR", title: "Real-time protection on every road", desc: "LexDrive uses Ola Maps and OpenStreetMap data to monitor speed zones. Get warned before you enter — not after.", tryBtn: "Try Speed Advisor", stats: ["Alert Speed", "Alert Types", "Countries"] },
    finebookPreview: { 
      tag: "FINEBOOK", 
      title: "Every fine. Explained clearly", 
      browseBtn: "Browse All Fines",
      cards: [
        { section: "Sec 183", title: "Over Speeding", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "Sec 184", title: "Dangerous Driving", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "Sec 194C", title: "No Seat Belt", fine: "₹1,000", severity: "medium" },
        { section: "Sec 177", title: "General Traffic Rules", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "VEHICLE CHECK", title: "Check your vehicle instantly", desc: "Enter your plate number to verify registration and check for pending challans in real-time.", placeholder: "e.g. MH12AB1234", verify: "Verify", noChallans: "No Pending Challans", owner: "Owner" },
    techStack: { tag: "BUILT WITH" },
    team: { tag: "THE TEAM", title: "Built by engineers, for drivers", desc: "The team behind LexDrive AI." },
    finalCta: { title: "Ready to drive smarter?", desc: "Free to use. No sign-up required. Your data stays on your device." },
    footer: { copyright: "LexDrive AI. All rights reserved.", platform: "Platform", finebook: "Finebook", speedAdvisor: "Speed Advisor" }
  },
  "hi-IN": {
    nav: { finebook: "फाइनबुक", languages: "भाषाएं", askAi: "AI से पूछें", startDriving: "ड्राइविंग शुरू करें" },
    hero: { tag: "AI रोड इंटेलिजेंस सक्रिय", title: "समझदारी से ड्राइव करें. कानूनी रहें", desc: "दुनिया का पहला AI-संचालित सड़क अनुपालन इंजन। Llama 3.1 द्वारा संचालित रीयल-टाइम कानूनी अलर्ट, ग्लोबल फाइन डेटाबेस और प्रोएक्टिव स्पीड गाइडेंस।" },
    features: {
      tag: "प्लेटफॉर्म", title: "चार इंजन. एक को-पायलट", desc: "LexDrive रीयल-टाइम कानूनी सलाहकार, ग्लोबल फाइन डेटाबेस, प्रोएक्टिव स्पीड मॉनिटर और मल्टीलिंगुअल वॉयस इंटरफेस को जोड़ता है।",
      cards: [
        { title: "Llama 3.1 इंटेलिजेंस", desc: "Groq के माध्यम से सब-सेकंड प्रतिक्रियाओं के साथ वॉयस-एक्टिवेटेड कानूनी प्रश्नोत्तर।" },
        { title: "वेब ब्लूटूथ स्पीड", desc: "ELM327 BLE के माध्यम से सीधे अपनी कार के ECU से जुड़ें।" },
        { title: "प्रोएक्टिव वॉयस अलर्ट", desc: "ओवरस्पीडिंग, आक्रामक ड्राइविंग और अन्य के लिए ऑटोमेटेड अलर्ट।" },
        { title: "OSM रोड डिटेक्शन", desc: "300 मीटर के भीतर स्कूलों, अस्पतालों और कैमरों का पता लगाता है।" },
        { title: "लाइव वेदर सेफ्टी", desc: "रीयल-टाइम मौसम के आधार पर गीली सड़क की चेतावनी और दृश्यता अलर्ट।" },
        { title: "ग्लोबल लीगल डेटाबेस", desc: "प्राकृतिक भाषा फ़िल्टरिंग के साथ 6 देशों में 115+ उल्लंघन।" }
      ]
    },
    pipeline: { tag: "सिस्टम आर्किटेक्चर", title: "LexDrive पाइपलाइन", steps: [{ title: "डेटा संग्रह", desc: "GPS और OBD-II गति स्ट्रीम करते हैं।" }, { title: "इंटेलिजेंस लेयर", desc: "स्थानीय यातायात नियमों के विरुद्ध व्यवहार का मूल्यांकन करता है।" }, { title: "प्रोएक्टिव अलर्ट", desc: "उल्लंघन से पहले वॉयस अलर्ट देता है।" }, { title: "वॉयस UI", desc: "3D रोबोट से प्रश्न पूछें और उत्तर प्राप्त करें।" }] },
    copilotCard: { tag: "फ्लैगशिप मॉड्यूल", title: "अपने AI को-पायलट से मिलें", desc: "Groq Llama 3.1 द्वारा संचालित 3D साथी। आवाज़ से कानूनी प्रश्न पूछें, 4 भाषाओं में उत्तर पाएं, और अलर्ट प्राप्त करें।", badges: ["वॉयस + टेक्स्ट", "4 भाषाएं", "<1s प्रतिक्रिया"] },
    howItWorks: { tag: "यह कैसे काम करता है", title: "प्रश्न से स्पष्टता तक तीन चरणों में", steps: [{ title: "पूछें या ड्राइव करें", desc: "अपना प्रश्न टाइप करें या बस ड्राइव करना शुरू करें।" }, { title: "तुरंत उत्तर प्राप्त करें", desc: "उद्धृत स्रोतों के साथ सटीक कानूनी उत्तर प्राप्त करें।" }, { title: "अनुपालन बनाए रखें", desc: "LexDrive पृष्ठभूमि में नियमों की निगरानी कर रहा है।" }] },
    speedAdvisor: { tag: "स्पीड एडवाइजर", title: "हर सड़क पर रीयल-टाइम सुरक्षा", desc: "LexDrive स्पीड ज़ोन की निगरानी के लिए Ola Maps और OSM डेटा का उपयोग करता है।", tryBtn: "स्पीड एडवाइजर आज़माएं", stats: ["अलर्ट स्पीड", "अलर्ट प्रकार", "देश"] },
    finebookPreview: { 
      tag: "फाइनबुक", 
      title: "हर जुर्माना. स्पष्ट रूप से समझाया गया", 
      browseBtn: "सभी जुर्माने ब्राउज़ करें",
      cards: [
        { section: "धारा 183", title: "तेज़ रफ़्तार", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "धारा 184", title: "खतरनाक ड्राइविंग", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "धारा 194C", title: "सीट बेल्ट नहीं", fine: "₹1,000", severity: "medium" },
        { section: "धारा 177", title: "सामान्य यातायात नियम", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "वाहन जांच", title: "अपने वाहन की तुरंत जांच करें", desc: "पंजीकरण सत्यापित करने और लंबित चालान की जांच करने के लिए अपना प्लेट नंबर दर्ज करें।", placeholder: "उदा. MH12AB1234", verify: "सत्यापित करें", noChallans: "कोई लंबित चालान नहीं", owner: "मालिक" },
    techStack: { tag: "इसके साथ निर्मित" },
    team: { tag: "टीम", title: "इंजीनियरों द्वारा, ड्राइवरों के लिए निर्मित", desc: "LexDrive AI के पीछे की टीम।" },
    finalCta: { title: "स्मार्ट ड्राइव करने के लिए तैयार हैं?", desc: "उपयोग करने के लिए निःशुल्क। कोई साइन-अप आवश्यक नहीं।" },
    footer: { copyright: "LexDrive AI. सर्वाधिकार सुरक्षित।", platform: "प्लेटफॉर्म", finebook: "फाइनबुक", speedAdvisor: "स्पीड एडवाइजर" }
  },
  "mr-IN": {
    nav: { finebook: "फाईनबुक", languages: "भाषा", askAi: "AI ला विचारा", startDriving: "ड्रायव्हिंग सुरू करा" },
    hero: { tag: "AI रोड इंटेलिजेंस सक्रिय", title: "स्मार्ट ड्रायव्ह करा. कायदेशीर राहा", desc: "जगातील पहिले AI-संचालित रस्ते अनुपालन इंजिन. Llama 3.1 द्वारे समर्थित रिअल-टाइम कायदेशीर अलर्ट, ग्लोबल फाईन डेटाबेस आणि प्रोएक्टिव्ह स्पीड मार्गदर्शन." },
    features: {
      tag: "प्लॅटफॉर्म", title: "चार इंजिन. एक को-पायलट", desc: "LexDrive रिअल-टाइम कायदेशीर सल्लागार, जागतिक दंड डेटाबेस, सक्रिय स्पीड मॉनिटर आणि बहुभाषिक व्हॉइस इंटरफेस एकत्र आणते.",
      cards: [
        { title: "Llama 3.1 इंटेलिजेंस", desc: "Groq द्वारे सब-सेकंड प्रतिसादांसह व्हॉइस-activated कायदेशीर प्रश्नोत्तरे." },
        { title: "वेब ब्लूटूथ स्पीड", desc: "ELM327 BLE द्वारे थेट तुमच्या कारच्या ECU शी कनेक्ट व्हा." },
        { title: "प्रोएक्टिव्ह व्हॉइस अलर्ट", desc: "ओव्हरस्पीडिंग, आक्रमक ड्रायव्हिंग आणि अधिकसाठी स्वयंचलित अलर्ट." },
        { title: "OSM रोड डिटेक्शन", desc: "300 मीटरच्या आत शाळा, रुग्णालये आणि कॅमेरे शोधते." },
        { title: "लाइव वेदर सेफ्टी", desc: "रिअल-टाइम हवामानावर आधारित ओल्या रस्त्याचा इशारा आणि दृश्यता अलर्ट." },
        { title: "ग्लोबल लीगल डेटाबेस", desc: "नैसर्गिक भाषा फिल्टरिंगसह 6 देशांमध्ये 115+ उल्लंघन." }
      ]
    },
    pipeline: { tag: "सिस्टम आर्किटेक्चर", title: "LexDrive पाइपलाइन", steps: [{ title: "डेटा संकलन", desc: "GPS आणि OBD-II वेग प्रवाहावर लक्ष ठेवतात." }, { title: "इंटेलिजन्स लेयर", desc: "स्थानिक वाहतूक नियमांविरुद्ध वर्तनाचे मूल्यांकन करते." }, { title: "प्रोएक्टिव्ह वॉर्निंग", desc: "उल्लंघनापूर्वी व्हॉइस अलर्ट तयार करते." }, { title: "व्हॉइस UI", desc: "3D रोबोटला प्रश्न विचारा आणि उत्तरे मिळवा." }] },
    copilotCard: { tag: "फ्लॅगशिप मॉड्युल", title: "तुमच्या AI को-पायलटला भेटा", desc: "Groq Llama 3.1 द्वारे समर्थित संपूर्ण संवादात्मक 3D साथीदार. आवाजाने कायदेशीर प्रश्न विचारा, 4 भाषांमध्ये त्वरित उत्तरे मिळवा.", badges: ["व्हॉइस + टेक्स्ट", "4 भाषा", "<1s प्रतिसाद"] },
    howItWorks: { tag: "हे कसे काम करते", title: "प्रश्नापासून स्पष्टतेपर्यंत तीन चरणांमध्ये", steps: [{ title: "विचारा किंवा चालवा", desc: "तुमचा प्रश्न टाइप करा किंवा ड्रायव्हिंग सुरू करा." }, { title: "त्वरित उत्तरे मिळवा", desc: "नमूद केलेल्या स्त्रोतांसह अचूक कायदेशीर उत्तरे मिळवा." }, { title: "अनुपालन सुनिश्चित करा", desc: "LexDrive पार्श्वभूमीत कायद्यांचे परीक्षण करत आहे हे जाणून आत्मविश्वासाने चालवा." }] },
    speedAdvisor: { tag: "स्पीड अ‍ॅडव्हायझर", title: "प्रत्येक रस्त्यावर रिअल-टाइम संरक्षण", desc: "LexDrive स्पीड झोनवर लक्ष ठेवण्यासाठी Ola Maps आणि OpenStreetMap डेटा वापरते.", tryBtn: "स्पीड अ‍ॅडव्हायझर वापरून पहा", stats: ["अलर्ट स्पीड", "अलर्ट प्रकार", "देश"] },
    finebookPreview: { 
      tag: "फाईनबुक", 
      title: "प्रत्येक दंड. स्पष्टपणे समजावून सांगितला", 
      browseBtn: "सर्व दंड ब्राउझ करा",
      cards: [
        { section: "कलम 183", title: "अतिवेगाने वाहन चालवणे", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "कलम 184", title: "धोकादायक ड्रायव्हिंग", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "कलम 194C", title: "सीट बेल्ट नाही", fine: "₹1,000", severity: "medium" },
        { section: "कलम 177", title: "सामान्य वाहतूक नियम", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "वाहन तपासणी", title: "तुमच्या वाहनाची त्वरित तपासणी करा", desc: "नोंदणी सत्यापित करण्यासाठी आणि रिअल-टाइममध्ये प्रलंबित चलनांची तपासणी करण्यासाठी तुमचा प्लेट नंबर प्रविष्ट करा.", placeholder: "उदा. MH12AB1234", verify: "सत्यापित करा", noChallans: "कोणतेही प्रलंबित चालान नाही", owner: "मालक" },
    techStack: { tag: "या तंत्रज्ञानावर आधारित" },
    team: { tag: "टीम", title: "इंजिनिअर्सनी, ड्रायव्हर्ससाठी बनवलेले", desc: "LexDrive AI मागील टीम." },
    finalCta: { title: "स्मार्ट ड्रायव्हिंगसाठी तयार आहात?", desc: "वापरण्यास विनामूल्य. कोणतीही साइन-अप आवश्यक नाही. तुमचा डेटा तुमच्या डिव्हाइसवर राहतो." },
    footer: { copyright: "LexDrive AI. सर्व हक्क राखीव.", platform: "प्लॅटफॉर्म", finebook: "फाईनबुक", speedAdvisor: "स्पीड एडवाइजर" }
  },
  "kn-IN": {
    nav: { finebook: "ಫೈನ್ ಬುಕ್", languages: "ಭಾಷೆಗಳು", askAi: "AI ಕೇಳಿ", startDriving: "ಚಾಲನೆ ಪ್ರಾರಂಭಿಸಿ" },
    hero: { tag: "AI ರಸ್ತೆ ಬುದ್ಧಿಮತ್ತೆ ಸಕ್ರಿಯ", title: "ಸ್ಮಾರ್ಟ್ ಆಗಿ ಚಾಲನೆ ಮಾಡಿ. ಕಾನೂನುಬದ್ಧವಾಗಿರಿ", desc: "ವಿಶ್ವದ ಮೊದಲ AI-ಚಾಲಿತ ರಸ್ತೆ ಅನುಸರಣೆ ಎಂಜಿನ್. ನೈಜ-ಸಮಯದ ಕಾನೂನು ಎಚ್ಚರಿಕೆಗಳು, ಜಾಗತಿಕ ದಂಡದ ಡೇಟಾಬೇಸ್ ಮತ್ತು ಲಾಮ 3.1 ರಿಂದ ಚಾಲಿತವಾದ ಪೂರ್ವಭಾವಿ ವೇಗ ಮಾರ್ಗದರ್ಶನ." },
    features: {
      tag: "ವೇದಿಕೆ", title: "ನಾಲ್ಕು ಎಂಜಿನ್ ಗಳು. ಒಬ್ಬ ಕೋ-ಪೈಲಟ್", desc: "LexDrive ನೈಜ-ಸಮಯದ ಕಾನೂನು ಸಲಹೆಗಾರ, ಜಾಗತಿಕ ದಂಡದ ಡೇಟಾಬೇಸ್, ಸಕ್ರಿಯ ವೇಗ ಮಾನಿಟರ್ ಮತ್ತು ಬಹುಭಾಷಾ ಧ್ವನಿ ಇಂಟರ್ಫೇಸ್ ಅನ್ನು ಸಂಯೋಜಿಸುತ್ತದೆ.",
      cards: [
        { title: "Llama 3.1 ಇಂಟೆಲಿಜೆನ್ಸ್", desc: "Groq ಮೂಲಕ ಉಪ-ಸೆಕೆಂಡ್ ಪ್ರತಿಕ್ರಿಯೆಗಳೊಂದಿಗೆ ಧ್ವನಿ-ಚಾಲಿತ ಕಾನೂನು ಪ್ರಶ್ನೋತ್ತರ." },
        { title: "ವೆಬ್ ಬ್ಲೂಟೂತ್ ವೇಗ", desc: "ELM327 BLE ಮೂಲಕ ನೇರವಾಗಿ ನಿಮ್ಮ ಕಾರಿನ ECU ಗೆ ಸಂಪರ್ಕಿಸಿ." },
        { title: "ಸಕ್ರಿಯ ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳು", desc: "ಅತಿ ವೇಗ, ಆಕ್ರಮಣಕಾರಿ ಚಾಲನೆ ಮತ್ತು ಹೆಚ್ಚಿನವುಗಳಿಗಾಗಿ ಸ್ವಯಂಚಾಲಿತ ಎಚ್ಚರಿಕೆಗಳು." },
        { title: "OSM ರಸ್ತೆ ಪತ್ತೆ", desc: "300 ಮೀಟರ್ ಒಳಗೆ ಶಾಲೆಗಳು, ಆಸ್ಪತ್ರೆಗಳು ಮತ್ತು ಕ್ಯಾಮೆರಾಗಳನ್ನು ಪತ್ತೆ ಮಾಡುತ್ತದೆ." },
        { title: "ಲೈವ್ ಹವಾಮಾನ ಸುರಕ್ಷತೆ", desc: "ನೈಜ-ಸಮಯದ ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ ಆರ್ದ್ರ ರಸ್ತೆ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಗೋಚರತೆಯ ಎಚ್ಚರಿಕೆಗಳು." },
        { title: "ಜಾಗತಿಕ ಕಾನೂನು ಡೇಟಾಬೇಸ್", desc: "ನೈಸರ್ಗಿಕ ಭಾಷಾ ಫಿಲ್ಟರಿಂಗ್ ನೊಂದಿಗೆ 6 ದೇಶಗಳಲ್ಲಿ 115+ ಉಲ್ಲಂಘನೆಗಳು." }
      ]
    },
    pipeline: { tag: "ಸಿಸ್ಟಮ್ ಆರ್ಕಿಟೆಕ್ಚರ್", title: "LexDrive ಪೈಪ್‌ಲೈನ್", steps: [{ title: "ಡೇಟಾ ಸಂಗ್ರಹಣೆ", desc: "GPS ಮತ್ತು OBD-II ವೇಗವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತದೆ." }, { title: "ಇಂಟೆಲಿಜೆನ್ಸ್ ಲೇಯರ್", desc: "ಸ್ಥಳೀಯ ಸಂಚಾರ ಕಾನೂನುಗಳ ವಿರುದ್ಧ ನಡವಳಿಕೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ." }, { title: "ಪೂರ್ವಭಾವಿ ಎಚ್ಚರಿಕೆ", desc: "ಉಲ್ಲಂಘನೆಗಳ ಮೊದಲು ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೀಡುತ್ತದೆ." }, { title: "ಧ್ವನಿ UI", desc: "3D ರೋಬೋಟ್ ಅನ್ನು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ." }] },
    copilotCard: { tag: "ಫ್ಲ್ಯಾಗ್‌ಶಿಪ್ ಮಾಡ್ಯೂಲ್", title: "ನಿಮ್ಮ AI ಕೋ-ಪೈಲಟ್ ಅನ್ನು ಭೇಟಿ ಮಾಡಿ", desc: "Groq Llama 3.1 ಚಾಲಿತ ಸಂಪೂರ್ಣ ಸಂವಾದಾತ್ಮಕ 3D ಒಡನಾಡಿ. ಧ್ವನಿಯ ಮೂಲಕ ಕಾನೂನು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ, 4 ಭಾಷೆಗಳಲ್ಲಿ ತ್ವರಿತ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.", badges: ["ಧ್ವನಿ + ಪಠ್ಯ", "4 ಭಾಷೆಗಳು", "<1s ಪ್ರತಿಕ್ರಿಯೆ"] },
    howItWorks: { tag: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ", title: "ಪ್ರಶ್ನೆಯಿಂದ ಸ್ಪಷ್ಟತೆಗೆ ಮೂರು ಹಂತಗಳಲ್ಲಿ", steps: [{ title: "ಕೇಳಿ ಅಥವಾ ಚಾಲನೆ ಮಾಡಿ", desc: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಚಾಲನೆ ಪ್ರಾರಂಭಿಸಿ." }, { title: "ತ್ವರಿತ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ", desc: "ಉಲ್ಲೇಖಿತ ಮೂಲಗಳೊಂದಿಗೆ ನಿಖರವಾದ ಕಾನೂನು ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ." }, { title: "ಅನುಸರಣೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ", desc: "LexDrive ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಕಾನೂನುಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತಿದೆ ಎಂದು ತಿಳಿದು ವಿಶ್ವಾಸದಿಂದ ಚಾಲನೆ ಮಾಡಿ." }] },
    speedAdvisor: { tag: "ವೇಗ ಸಲಹೆಗಾರ", title: "ಪ್ರತಿ ರಸ್ತೆಯಲ್ಲಿ ನೈಜ-ಸಮಯದ ರಕ್ಷಣೆ", desc: "LexDrive ವೇಗ ವಲಯಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು Ola Maps ಮತ್ತು OpenStreetMap ಡೇಟಾವನ್ನು ಬಳಸುತ್ತದೆ.", tryBtn: "ವೇಗ ಸಲಹೆಗಾರರನ್ನು ಪ್ರಯತ್ನಿಸಿ", stats: ["ಎಚ್ಚರಿಕೆ ವೇಗ", "ಎಚ್ಚರಿಕೆ ಪ್ರಕಾರಗಳು", "ದೇಶಗಳು"] },
    finebookPreview: { 
      tag: "ಫೈನ್ ಬುಕ್", 
      title: "ಪ್ರತಿಯೊಂದು ದಂಡ. ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಲಾಗಿದೆ", 
      browseBtn: "ಎಲ್ಲಾ ದಂಡಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ",
      cards: [
        { section: "ಸೆಕ್ಷನ್ 183", title: "ಅತಿ ವೇಗ", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "ಸೆಕ್ಷನ್ 184", title: "ಅಪಾಯಕಾರಿ ಚಾಲನೆ", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "ಸೆಕ್ಷನ್ 194C", title: "ಸೀಟ್ ಬೆಲ್ಟ್ ಇಲ್ಲ", fine: "₹1,000", severity: "medium" },
        { section: "ಸೆಕ್ಷನ್ 177", title: "ಸಾಮಾನ್ಯ ಸಂಚಾರ ನಿಯಮಗಳು", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "ವಾಹನ ಪರಿಶೀಲನೆ", title: "ನಿಮ್ಮ ವಾಹನವನ್ನು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ", desc: "ನೋಂದಣಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಮತ್ತು ನೈಜ-ಸಮಯದಲ್ಲಿ ಬಾಕಿ ಇರುವ ಚಲನ್ ಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ನಿಮ್ಮ ಪ್ಲೇಟ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.", placeholder: "ಉದಾ. MH12AB1234", verify: "ಪರಿಶೀಲಿಸಿ", noChallans: "ಯಾವುದೇ ಬಾಕಿ ಇರುವ ಚಲನ್ ಗಳಿಲ್ಲ", owner: "ಮಾಲೀಕ" },
    techStack: { tag: "ಇದರೊಂದಿಗೆ ನಿರ್ಮಿಸಲಾಗಿದೆ" },
    team: { tag: "ತಂಡ", title: "ಇಂಜಿನಿಯರ್ ಗಳಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ, ಚಾಲಕರಿಗಾಗಿ", desc: "LexDrive AI ಹಿಂದಿರುವ ತಂಡ." },
    finalCta: { title: "ಸ್ಮಾರ್ಟ್ ಆಗಿ ಚಾಲನೆ ಮಾಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ?", desc: "ಬಳಸಲು ಉಚಿತ. ಯಾವುದೇ ಸೈನ್-ಅಪ್ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಡೇಟಾ ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತದೆ." },
    footer: { copyright: "LexDrive AI. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.", platform: "ವೇದಿಕೆ", finebook: "ಫೈನ್ ಬುಕ್", speedAdvisor: "ವೇಗ ಸಲಹೆಗಾರ" }
  },
  "bn-IN": {
    nav: { finebook: "ফাইনবুক", languages: "ভাষা", askAi: "AI কে জিজ্ঞাসা করুন", startDriving: "ড্রাইভিং শুরু করুন" },
    hero: { tag: "AI রোড ইন্টেলিজেন্স সক্রিয়", title: "স্মার্টভাবে ড্রাইভ করুন। আইনি থাকুন", desc: "বিশ্বের প্রথম AI-চালিত রোড কমপ্লায়েন্স ইঞ্জিন। Llama 3.1 দ্বারা পরিচালিত রিয়েল-টাইম আইনি সতর্কতা, বৈশ্বিক জরিমানা ডেটাবেস এবং সক্রিয় গতি নির্দেশনা।" },
    features: {
      tag: "প্ল্যাটফর্ম", title: "চারটি ইঞ্জিন। একটি কো-পাইলট", desc: "LexDrive রিয়েল-টাইম আইনি উপদেষ্টা, বৈশ্বিক জরিমানা ডেটাবেস, সক্রিয় গতি মনিটর এবং বহুভাষিক ভয়েস ইন্টারফেস একত্রিত করে।",
      cards: [
        { title: "Llama 3.1 ইন্টেলিজেন্স", desc: "Groq-এর মাধ্যমে সাব-সেকেন্ড প্রতিক্রিয়া সহ ভয়েস-সক্রিয় আইনি Q&A।" },
        { title: "ওয়েব ব্লুটুথ গতি", desc: "ELM327 BLE-এর মাধ্যমে সরাসরি আপনার গাড়ির ECU-তে সংযুক্ত হন।" },
        { title: "সক্রিয় ভয়েস সতর্কতা", desc: "অতিরিক্ত গতি, আক্রমণাত্মক ড্রাইভিংয়ের জন্য স্বয়ংক্রিয় সতর্কতা।" },
        { title: "OSM রোড ডিটেকশন", desc: "300 মিটারের মধ্যে স্কুল, হাসপাতাল এবং ক্যামেরা সনাক্ত করে।" },
        { title: "লাইভ আবহাওয়া নিরাপত্তা", desc: "রিয়েল-টাইম আবহাওয়ার উপর ভিত্তি করে ভেজা রাস্তার সতর্কতা।" },
        { title: "বৈশ্বিক আইনি ডেটাবেস", desc: "প্রাকৃতিক ভাষা ফিল্টারিং সহ 6টি দেশে 115+ লঙ্ঘন।" }
      ]
    },
    pipeline: { tag: "সিস্টেম আর্কিটেকচার", title: "LexDrive পাইপলাইন", steps: [{ title: "ডেটা সংগ্রহ", desc: "GPS ও OBD-II গতি ট্র্যাক করে।" }, { title: "ইন্টেলিজেন্স স্তর", desc: "স্থানীয় ট্রাফিক আইনের বিরুদ্ধে আচরণ মূল্যায়ন করে।" }, { title: "সক্রিয় সতর্কতা", desc: "লঙ্ঘনের আগে ভয়েস সতর্কতা দেয়।" }, { title: "ভয়েস UI", desc: "3D রোবটকে প্রশ্ন করুন এবং উত্তর পান।" }] },
    copilotCard: { tag: "ফ্ল্যাগশিপ মডিউল", title: "আপনার AI কো-পাইলটের সাথে পরিচিত হন", desc: "Groq Llama 3.1 দ্বারা চালিত সম্পূর্ণ ইন্টারেক্টিভ 3D সঙ্গী। ভয়েসে আইনি প্রশ্ন করুন এবং 4টি ভাষায় উত্তর পান।", badges: ["ভয়েস + টেক্সট", "4টি ভাষা", "<1s প্রতিক্রিয়া"] },
    howItWorks: { tag: "কিভাবে কাজ করে", title: "তিনটি ধাপে প্রশ্ন থেকে স্পষ্টতা", steps: [{ title: "জিজ্ঞাসা করুন বা ড্রাইভ করুন", desc: "আপনার প্রশ্ন টাইপ করুন বা ড্রাইভ শুরু করুন।" }, { title: "তাৎক্ষণিক উত্তর পান", desc: "উদ্ধৃত উৎস সহ সঠিক আইনি উত্তর পান।" }, { title: "সম্মত থাকুন", desc: "LexDrive আইন পর্যবেক্ষণ করছে জেনে আত্মবিশ্বাসের সাথে ড্রাইভ করুন।" }] },
    speedAdvisor: { tag: "স্পিড অ্যাডভাইজর", title: "প্রতিটি রাস্তায় রিয়েল-টাইম সুরক্ষা", desc: "LexDrive গতি অঞ্চল পর্যবেক্ষণ করতে Ola Maps এবং OSM ডেটা ব্যবহার করে।", tryBtn: "স্পিড অ্যাডভাইজর চেষ্টা করুন", stats: ["সতর্কতা গতি", "সতর্কতার ধরন", "দেশ"] },
    finebookPreview: {
      tag: "ফাইনবুক",
      title: "প্রতিটি জরিমানা। স্পষ্টভাবে ব্যাখ্যা করা হয়েছে",
      browseBtn: "সমস্ত জরিমানা দেখুন",
      cards: [
        { section: "ধারা 183", title: "অতিরিক্ত গতি", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "ধারা 184", title: "বিপজ্জনক ড্রাইভিং", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "ধারা 194C", title: "সিটবেল্ট নেই", fine: "₹1,000", severity: "medium" },
        { section: "ধারা 177", title: "সাধারণ ট্রাফিক নিয়ম", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "যানবাহন যাচাই", title: "আপনার যানবাহন তাৎক্ষণিকভাবে যাচাই করুন", desc: "নিবন্ধন যাচাই করতে এবং মুলতুবি চালান পরীক্ষা করতে আপনার প্লেট নম্বর প্রবেশ করুন।", placeholder: "যেমন MH12AB1234", verify: "যাচাই করুন", noChallans: "কোনো মুলতুবি চালান নেই", owner: "মালিক" },
    techStack: { tag: "তৈরি করা হয়েছে" },
    team: { tag: "দল", title: "প্রকৌশলীদের দ্বারা, চালকদের জন্য তৈরি", desc: "LexDrive AI-এর পেছনের দল।" },
    finalCta: { title: "স্মার্টভাবে ড্রাইভ করতে প্রস্তুত?", desc: "বিনামূল্যে ব্যবহারযোগ্য। কোনো সাইন-আপ প্রয়োজন নেই।" },
    footer: { copyright: "LexDrive AI. সর্বস্বত্ব সংরক্ষিত।", platform: "প্ল্যাটফর্ম", finebook: "ফাইনবুক", speedAdvisor: "স্পিড অ্যাডভাইজর" }
  },
  "gu-IN": {
    nav: { finebook: "ફાઇનબુક", languages: "ભાષાઓ", askAi: "AI ને પૂછો", startDriving: "ડ્રાઇવિંગ શરૂ કરો" },
    hero: { tag: "AI રોડ ઇન્ટેલિજન્સ સક્રિય", title: "સ્માર્ટ ડ્રાઇવ કરો. કાનૂની રહો", desc: "વિશ્વનું પ્રથમ AI-સંચાલિત રોડ કમ્પ્લાયન્સ એન્જિન. Llama 3.1 દ્વારા સંચાલિત રીઅલ-ટાઇમ કાનૂની ચેતવણીઓ, ગ્લોબલ ફાઇન ડેટાબેઝ અને સક્રિય ઝડપ માર્ગદર્શન." },
    features: {
      tag: "પ્લેટફોર્મ", title: "ચાર એન્જિન. એક કો-પાઇલટ", desc: "LexDrive રીઅલ-ટાઇમ કાનૂની સલાહકાર, ગ્લોબલ ફાઇન ડેટાબેઝ, સક્રિય ઝડપ મોનિટર અને બહુભાષી વૉઇસ ઇન્ટરફેસ ભેગા કરે છે.",
      cards: [
        { title: "Llama 3.1 ઇન્ટેલિજન્સ", desc: "Groq દ્વારા સબ-સેકન્ડ પ્રતિભાવ સાથે વૉઇસ-સક્રિય કાનૂની Q&A." },
        { title: "વેબ બ્લૂટૂથ ઝડપ", desc: "ELM327 BLE દ્વારા સીધા તમારી કારના ECU સાથે જોડાઓ." },
        { title: "સક્રિય વૉઇસ ચેતવણીઓ", desc: "ઓવરસ્પીડિંગ, આક્રમક ડ્રાઇવિંગ માટે સ્વયંચાલિત ચેતવણીઓ." },
        { title: "OSM રોડ ડિટેક્શન", desc: "300 મીટરની અંદર શાળાઓ, હોસ્પિટલો અને કેમેરા શોધે છે." },
        { title: "લાઇવ હવામાન સલામતી", desc: "રીઅલ-ટાઇમ હવામાનના આધારે ભીના રોડ ચેતવણીઓ." },
        { title: "ગ્લોબલ કાનૂની ડેટાબેઝ", desc: "કુદરતી ભાષા ફિલ્ટરિંગ સાથે 6 દેશોમાં 115+ ઉલ્લંઘન." }
      ]
    },
    pipeline: { tag: "સિસ્ટમ આર્કિટેક્ચર", title: "LexDrive પાઇપલાઇન", steps: [{ title: "ડેટા સંગ્રહ", desc: "GPS અને OBD-II ઝડપ ટ્રૅક કરે છે." }, { title: "ઇન્ટેલિજન્સ સ્તર", desc: "સ્થાનિક ટ્રાફિક કાયદા સામે વર્તનનું મૂલ્યાંકન કરે છે." }, { title: "સક્રિય ચેતવણી", desc: "ઉલ્લંઘન પહેલા વૉઇસ ચેતવણીઓ આપે છે." }, { title: "વૉઇસ UI", desc: "3D રોબોટને પ્રશ્નો પૂછો અને જવાબ મેળવો." }] },
    copilotCard: { tag: "ફ્લેગશિપ મૉડ્યૂલ", title: "તમારા AI કો-પાઇલટને મળો", desc: "Groq Llama 3.1 દ્વારા સંચાલિત સંપૂર્ણ ઇન્ટરેક્ટિવ 3D સાથી. વૉઇસ દ્વારા કાનૂની પ્રશ્નો પૂછો, 4 ભાષાઓમાં જવાબ મેળવો.", badges: ["વૉઇસ + ટેક્સ્ટ", "4 ભાષાઓ", "<1s પ્રતિભાવ"] },
    howItWorks: { tag: "કેવી રીતે કામ કરે છે", title: "ત્રણ પગલામાં પ્રશ્નથી સ્પષ્ટતા", steps: [{ title: "પૂછો અથવા ડ્રાઇવ કરો", desc: "તમારો પ્રશ્ન ટાઇપ કરો અથવા ડ્રાઇવ શરૂ કરો." }, { title: "તાત્કાલિક જવાબ મળો", desc: "ઉદ્ધૃત સ્ત્રોતો સાથે ચોક્કસ કાનૂની જવાબ મળો." }, { title: "અનુપાલિત રહો", desc: "LexDrive કાયદા મૉનિટર કરે છે જાણી આત્મવિશ્વાસથી ડ્રાઇવ કરો." }] },
    speedAdvisor: { tag: "સ્પીડ એડવાઇઝર", title: "દરેક રોડ પર રીઅલ-ટાઇમ સુરક્ષા", desc: "LexDrive ઝડપ ઝોન મૉનિટર કરવા Ola Maps અને OSM ડેટા વાપરે છે.", tryBtn: "સ્પીડ એડવાઇઝર અજમાવો", stats: ["ચેતવણી ઝડપ", "ચેતવણીના પ્રકાર", "દેશ"] },
    finebookPreview: {
      tag: "ફાઇનબુક",
      title: "દરેક દંડ. સ્પષ્ટ રીતે સમજાવ્યો",
      browseBtn: "બધા દંડ જુઓ",
      cards: [
        { section: "કલમ 183", title: "અતિ ઝડપ", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "કલમ 184", title: "ખતરનાક ડ્રાઇવિંગ", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "કલમ 194C", title: "સીટ બેલ્ટ નહીં", fine: "₹1,000", severity: "medium" },
        { section: "કલમ 177", title: "સામાન્ય ટ્રાફિક નિયમ", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "વાહન ચકાસણી", title: "તમારું વાહન તાત્કાલિક ચકાસો", desc: "નોંધણી ચકાસવા અને પ્રલંબિત ચાલણ ચકાસવા માટે તમારો પ્લેટ નંબર દાખલ કરો.", placeholder: "દા.ત. MH12AB1234", verify: "ચકાસો", noChallans: "કોઈ પ્રલંબિત ચાલણ નથી", owner: "માલિક" },
    techStack: { tag: "સાથે બનાવ્યું" },
    team: { tag: "ટીમ", title: "ઇજનેરો દ્વારા, ડ્રાઇવરો માટે બનાવ્યું", desc: "LexDrive AI પાછળની ટીમ." },
    finalCta: { title: "સ્માર્ટ ડ્રાઇવ કરવા તૈયાર?", desc: "ઉપયોગ માટે મફત. કોઈ સાઇન-અપ જરૂરી નથી." },
    footer: { copyright: "LexDrive AI. બધા અધિકાર સુરક્ષિત.", platform: "પ્લેટફોર્મ", finebook: "ફાઇનબુક", speedAdvisor: "સ્પીડ એડવાઇઝર" }
  },
  "ta-IN": {
    nav: { finebook: "அபராத புத்தகம்", languages: "மொழிகள்", askAi: "AI கேளுங்கள்", startDriving: "வாகனம் ஓட்டத் தொடங்குங்கள்" },
    hero: { tag: "AI சாலை நுண்ணறிவு செயலில்", title: "புத்திசாலியாக ஓட்டுங்கள். சட்டப்படி இருங்கள்", desc: "உலகின் முதல் AI-இயக்கப்படும் சாலை இணக்க இயந்திரம். Llama 3.1 ஆல் இயக்கப்படும் நேரடி சட்ட எச்சரிக்கைகள், உலகளாவிய அபராத தரவுத்தளம் மற்றும் முன்னெச்சரிக்கை வேக வழிகாட்டுதல்." },
    features: {
      tag: "தளம்", title: "நான்கு இயந்திரங்கள். ஒரு கோ-பைலட்", desc: "LexDrive நேரடி சட்ட ஆலோசகர், உலகளாவிய அபராத தரவுத்தளம், முன்னெச்சரிக்கை வேக மானிட்டர் மற்றும் பலமொழி குரல் இடைமுகம் ஆகியவற்றை இணைக்கிறது.",
      cards: [
        { title: "Llama 3.1 நுண்ணறிவு", desc: "Groq வழியாக துணை-வினாடி பதில்களுடன் குரல்-இயக்கப்படும் சட்ட Q&A." },
        { title: "வலை புளூடூத் வேகம்", desc: "ELM327 BLE வழியாக உங்கள் கார் ECU உடன் நேரடியாக இணைக்கவும்." },
        { title: "முன்னெச்சரிக்கை குரல் எச்சரிக்கைகள்", desc: "அதிவேகம், ஆக்கிரமிப்பு ஓட்டம் ஆகியவற்றுக்கு தானியங்கி எச்சரிக்கைகள்." },
        { title: "OSM சாலை கண்டறிதல்", desc: "300 மீட்டருக்குள் பள்ளிகள், மருத்துவமனைகள் மற்றும் கேமராக்களை கண்டறிகிறது." },
        { title: "நேரடி வானிலை பாதுகாப்பு", desc: "நேரடி வானிலையின் அடிப்படையில் ஈரமான சாலை எச்சரிக்கைகள்." },
        { title: "உலகளாவிய சட்ட தரவுத்தளம்", desc: "இயற்கை மொழி வடிகட்டலுடன் 6 நாடுகளில் 115+ மீறல்கள்." }
      ]
    },
    pipeline: { tag: "கணினி கட்டமைப்பு", title: "LexDrive குழாய்", steps: [{ title: "தரவு சேகரிப்பு", desc: "GPS மற்றும் OBD-II வேகம் கண்காணிக்கிறது." }, { title: "நுண்ணறிவு அடுக்கு", desc: "உள்ளூர் போக்குவரத்து சட்டங்களுக்கு எதிராக நடத்தையை மதிப்பீடு செய்கிறது." }, { title: "முன்னெச்சரிக்கை", desc: "மீறல்களுக்கு முன் குரல் எச்சரிக்கைகள் தருகிறது." }, { title: "குரல் UI", desc: "3D ரோபோட்டிடம் கேள்விகள் கேளுங்கள்." }] },
    copilotCard: { tag: "முன்னணி தொகுதி", title: "உங்கள் AI கோ-பைலட்டை சந்தியுங்கள்", desc: "Groq Llama 3.1 ஆல் இயக்கப்படும் முழு ஊடாடும் 3D துணை. குரலில் சட்ட கேள்விகள் கேளுங்கள், 4 மொழிகளில் பதில் பெறுங்கள்.", badges: ["குரல் + உரை", "4 மொழிகள்", "<1s பதில்"] },
    howItWorks: { tag: "எப்படி வேலை செய்கிறது", title: "மூன்று படிகளில் கேள்வியிலிருந்து தெளிவுக்கு", steps: [{ title: "கேளுங்கள் அல்லது ஓட்டுங்கள்", desc: "உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள் அல்லது ஓட்டத் தொடங்குங்கள்." }, { title: "உடனடி பதில் பெறுங்கள்", desc: "மேற்கோள் காட்டிய ஆதாரங்களுடன் சட்ட பதில்கள் பெறுங்கள்." }, { title: "இணங்கி இருங்கள்", desc: "LexDrive சட்டங்களை கண்காணிக்கிறது என்று நம்பிக்கையுடன் ஓட்டுங்கள்." }] },
    speedAdvisor: { tag: "வேக ஆலோசகர்", title: "ஒவ்வொரு சாலையிலும் நேரடி பாதுகாப்பு", desc: "LexDrive வேக மண்டலங்களை கண்காணிக்க Ola Maps மற்றும் OSM தரவைப் பயன்படுத்துகிறது.", tryBtn: "வேக ஆலோசகரை முயற்சிக்கவும்", stats: ["எச்சரிக்கை வேகம்", "எச்சரிக்கை வகைகள்", "நாடுகள்"] },
    finebookPreview: {
      tag: "அபராத புத்தகம்",
      title: "ஒவ்வொரு அபராதமும். தெளிவாக விளக்கப்பட்டுள்ளது",
      browseBtn: "அனைத்து அபராதங்களையும் பார்க்கவும்",
      cards: [
        { section: "பிரிவு 183", title: "அதிவேகம்", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "பிரிவு 184", title: "ஆபத்தான ஓட்டம்", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "பிரிவு 194C", title: "சீட்பெல்ட் இல்லை", fine: "₹1,000", severity: "medium" },
        { section: "பிரிவு 177", title: "பொது போக்குவரத்து விதிகள்", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "வாகன சரிபார்ப்பு", title: "உங்கள் வாகனத்தை உடனடியாக சரிபார்க்கவும்", desc: "பதிவை சரிபார்க்கவும் மற்றும் நிலுவையில் உள்ள சலான்களை சரிபார்க்கவும் உங்கள் பலகை எண்ணை உள்ளிடவும்.", placeholder: "எ.கா. MH12AB1234", verify: "சரிபார்க்கவும்", noChallans: "நிலுவை சலான்கள் இல்லை", owner: "உரிமையாளர்" },
    techStack: { tag: "இதனால் கட்டப்பட்டது" },
    team: { tag: "குழு", title: "பொறியியலாளர்களால், ஓட்டுனர்களுக்காக கட்டப்பட்டது", desc: "LexDrive AI பின்னால் உள்ள குழு." },
    finalCta: { title: "புத்திசாலியாக ஓட்ட தயாரா?", desc: "பயன்படுத்த இலவசம். பதிவு தேவையில்லை." },
    footer: { copyright: "LexDrive AI. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.", platform: "தளம்", finebook: "அபராத புத்தகம்", speedAdvisor: "வேக ஆலோசகர்" }
  },
  "te-IN": {
    nav: { finebook: "ఫైన్‌బుక్", languages: "భాషలు", askAi: "AI అడగండి", startDriving: "డ్రైవింగ్ ప్రారంభించండి" },
    hero: { tag: "AI రోడ్ ఇంటెలిజెన్స్ సక్రియం", title: "తెలివిగా నడపండి. చట్టబద్ధంగా ఉండండి", desc: "ప్రపంచపు మొట్టమొదటి AI-ఆధారిత రోడ్ కంప్లయన్స్ ఇంజిన్. Llama 3.1 ద్వారా నేరుగా చట్ట హెచ్చరికలు, గ్లోబల్ ఫైన్ డేటాబేస్ మరియు ముందస్తు వేగ మార్గదర్శనం." },
    features: {
      tag: "ప్లాట్‌ఫారమ్", title: "నాలుగు ఇంజిన్లు. ఒక కో-పైలట్", desc: "LexDrive నేరుగా చట్ట సలహాదారు, గ్లోబల్ ఫైన్ డేటాబేస్, ముందస్తు వేగ మానిటర్ మరియు బహుభాషా వాయిస్ ఇంటర్‌ఫేస్‌ను కలుపుతుంది.",
      cards: [
        { title: "Llama 3.1 ఇంటెలిజెన్స్", desc: "Groq ద్వారా సబ్-సెకండ్ ప్రతిస్పందనలతో వాయిస్-యాక్టివేటెడ్ చట్ట Q&A." },
        { title: "వెబ్ బ్లూటూత్ వేగం", desc: "ELM327 BLE ద్వారా మీ కారు ECUతో నేరుగా కనెక్ట్ అవ్వండి." },
        { title: "ముందస్తు వాయిస్ హెచ్చరికలు", desc: "అతి వేగం, దూకుడు డ్రైవింగ్‌కు స్వయంచాలక హెచ్చరికలు." },
        { title: "OSM రోడ్ డిటెక్షన్", desc: "300 మీటర్ల లోపు పాఠశాలలు, ఆసుపత్రులు మరియు కెమెరాలు గుర్తిస్తుంది." },
        { title: "లైవ్ వాతావరణ భద్రత", desc: "నేరుగా వాతావరణం ఆధారంగా తడి రోడ్ హెచ్చరికలు." },
        { title: "గ్లోబల్ చట్ట డేటాబేస్", desc: "సహజ భాష ఫిల్టరింగ్‌తో 6 దేశాలలో 115+ ఉల్లంఘనలు." }
      ]
    },
    pipeline: { tag: "సిస్టమ్ ఆర్కిటెక్చర్", title: "LexDrive పైప్‌లైన్", steps: [{ title: "డేటా సేకరణ", desc: "GPS మరియు OBD-II వేగం ట్రాక్ చేస్తుంది." }, { title: "ఇంటెలిజెన్స్ లేయర్", desc: "స్థానిక ట్రాఫిక్ చట్టాలకు వ్యతిరేకంగా ప్రవర్తనను అంచనా వేస్తుంది." }, { title: "ముందస్తు హెచ్చరిక", desc: "ఉల్లంఘనలకు ముందే వాయిస్ హెచ్చరికలు ఇస్తుంది." }, { title: "వాయిస్ UI", desc: "3D రోబోట్‌ను ప్రశ్నలు అడగండి మరియు సమాధానాలు పొందండి." }] },
    copilotCard: { tag: "ఫ్లాగ్‌షిప్ మాడ్యూల్", title: "మీ AI కో-పైలట్‌ని కలవండి", desc: "Groq Llama 3.1 ద్వారా పూర్తి ఇంటరాక్టివ్ 3D సహచరుడు. వాయిస్‌లో చట్ట ప్రశ్నలు అడగండి, 4 భాషలలో సమాధానాలు పొందండి.", badges: ["వాయిస్ + టెక్స్ట్", "4 భాషలు", "<1s ప్రతిస్పందన"] },
    howItWorks: { tag: "ఇది ఎలా పనిచేస్తుంది", title: "మూడు దశలలో ప్రశ్న నుండి స్పష్టతకు", steps: [{ title: "అడగండి లేదా నడపండి", desc: "మీ ప్రశ్న టైప్ చేయండి లేదా డ్రైవింగ్ ప్రారంభించండి." }, { title: "తక్షణ సమాధానాలు పొందండి", desc: "ఉల్లేఖించిన మూలాలతో ఖచ్చితమైన చట్ట సమాధానాలు పొందండి." }, { title: "సమ్మతంగా ఉండండి", desc: "LexDrive చట్టాలను పర్యవేక్షిస్తోంది అని నమ్మకంగా నడపండి." }] },
    speedAdvisor: { tag: "స్పీడ్ అడ్వైజర్", title: "ప్రతి రోడ్‌లో నేరుగా రక్షణ", desc: "LexDrive వేగ జోన్లను పర్యవేక్షించడానికి Ola Maps మరియు OSM డేటాను ఉపయోగిస్తుంది.", tryBtn: "స్పీడ్ అడ్వైజర్ ప్రయత్నించండి", stats: ["హెచ్చరిక వేగం", "హెచ్చరిక రకాలు", "దేశాలు"] },
    finebookPreview: {
      tag: "ఫైన్‌బుక్",
      title: "ప్రతి జరిమానా. స్పష్టంగా వివరించబడింది",
      browseBtn: "అన్ని జరిమానాలు చూడండి",
      cards: [
        { section: "సెక్షన్ 183", title: "అతి వేగం", fine: "₹1,000 – ₹2,000", severity: "high" },
        { section: "సెక్షన్ 184", title: "ప్రమాదకర డ్రైవింగ్", fine: "₹1,000 – ₹5,000", severity: "high" },
        { section: "సెక్షన్ 194C", title: "సీట్‌బెల్ట్ లేదు", fine: "₹1,000", severity: "medium" },
        { section: "సెక్షన్ 177", title: "సాధారణ ట్రాఫిక్ నిబంధనలు", fine: "₹500", severity: "low" }
      ]
    },
    challan: { tag: "వాహన తనిఖీ", title: "మీ వాహనాన్ని వెంటనే తనిఖీ చేయండి", desc: "నమోదు ధృవీకరించడానికి మరియు పెండింగ్ చలాన్లు తనిఖీ చేయడానికి మీ ప్లేట్ నంబర్ నమోదు చేయండి.", placeholder: "ఉదా. MH12AB1234", verify: "ధృవీకరించండి", noChallans: "పెండింగ్ చలాన్లు లేవు", owner: "యజమాని" },
    techStack: { tag: "ఇతో నిర్మించబడింది" },
    team: { tag: "జట్టు", title: "ఇంజినీర్లచే, డ్రైవర్ల కోసం నిర్మించబడింది", desc: "LexDrive AI వెనుక ఉన్న జట్టు." },
    finalCta: { title: "తెలివిగా నడపడానికి సిద్ధంగా ఉన్నారా?", desc: "ఉపయోగించడానికి ఉచితం. సైన్-అప్ అవసరం లేదు." },
    footer: { copyright: "LexDrive AI. అన్ని హక్కులు రక్షించబడ్డాయి.", platform: "ప్లాట్‌ఫారమ్", finebook: "ఫైన్‌బుక్", speedAdvisor: "స్పీడ్ అడ్వైజర్" }
  }
};

// ── Car/Drive mode UI strings (all 8 languages) ──
export const carTranslations: Record<string, any> = {
  "en-IN": {
    terminal: "TERMINAL", displayMode: "Display Mode",
    radar: "Radar", map: "Map", dashcam: "Dashcam AI",
    gpsTelemetry: "GPS Telemetry", obdTelemetry: "OBD-II Telemetry",
    speed: "SPEED", limit: "LIMIT", kmh: "KM/H",
    connectObd: "Connect OBD-II", obdLive: "OBD-II Live", connecting: "Connecting…",
    endTrip: "End Trip", currentSpeed: "Current Speed",
    drivingAnalytics: "Driving Analytics", safetyScore: "Safety Score",
    excellent: "Excellent 😇", good: "Good 🛡️", needsWork: "Needs work ⚠️",
    violations: "Active Law Violations",
    overspeedTitle: "Overspeeding Detected",
    overspeedDesc: "Section 183 MVA. Fine ₹1,000–₹2,000. Slow down immediately.",
    noViolations: "No Violations Detected",
    noViolationsDesc: "Perfect compliance. Scanning surroundings...",
    compliance: "Compliance Check //",
    seatbelt: "Seatbelts Mandatory", noPhone: "No Mobile Phones", laneDiscipline: "Lane Discipline Enforced",
    tapToTransmit: "Tap to Transmit", listening: "Listening...",
  },
  "hi-IN": {
    terminal: "टर्मिनल", displayMode: "डिस्प्ले मोड",
    radar: "रडार", map: "नकशा", dashcam: "डैशकैम AI",
    gpsTelemetry: "GPS टेलीमेट्री", obdTelemetry: "OBD-II टेलीमेट्री",
    speed: "गति", limit: "सीमा", kmh: "KM/H",
    connectObd: "OBD-II जोड़ें", obdLive: "OBD-II लाइव", connecting: "जोड़ा जा रहा है…",
    endTrip: "यात्रा समाप्त करें", currentSpeed: "वर्तमान गति",
    drivingAnalytics: "ड्राइविंग विश्लेषण", safetyScore: "सुरक्षा स्कोर",
    excellent: "उत्कृष्ट 😇", good: "अच्छा 🛡️", needsWork: "सुधार जरूरी ⚠️",
    violations: "सक्रिय कानून उल्लंघन",
    overspeedTitle: "अतिगति पता चली",
    overspeedDesc: "धारा 183 MVA. जुर्माना ₹1,000–₹2,000. तुरंत धीमा करें।",
    noViolations: "कोई उल्लंघन नहीं",
    noViolationsDesc: "पूर्ण अनुपालन। स्कैन हो रहा है...",
    compliance: "अनुपालन जांच //",
    seatbelt: "सीटबेल्ट अनिवार्य", noPhone: "मोबाइल फोन नहीं", laneDiscipline: "लेन अनुशासन अनिवार्य",
    tapToTransmit: "बोलने के लिए टैप करें", listening: "सुन रहा है...",
  },
  "mr-IN": {
    terminal: "टर्मिनल", displayMode: "डिस्प्ले मोड",
    radar: "रडार", map: "नकाशा", dashcam: "डॅशकॅम AI",
    gpsTelemetry: "GPS टेलीमेट्री", obdTelemetry: "OBD-II टेलीमेट्री",
    speed: "वेग", limit: "मर्यादा", kmh: "KM/H",
    connectObd: "OBD-II जोडा", obdLive: "OBD-II लाइव्ह", connecting: "जोडत आहे…",
    endTrip: "प्रवास संपवा", currentSpeed: "सध्याचा वेग",
    drivingAnalytics: "ड्रायव्हिंग विश्लेषण", safetyScore: "सुरक्षा स्कोअर",
    excellent: "उत्कृष्ट 😇", good: "चांगले 🛡️", needsWork: "सुधारणा हवी ⚠️",
    violations: "सक्रिय कायदे उल्लंघन",
    overspeedTitle: "अतिवेग आढळला",
    overspeedDesc: "कलम 183 MVA. दंड ₹1,000–₹2,000. लगेच मंद व्हा.",
    noViolations: "कोणतेही उल्लंघन नाही",
    noViolationsDesc: "पूर्ण अनुपालन. स्कॅन होत आहे...",
    compliance: "अनुपालन तपासणी //",
    seatbelt: "सीटबेल्ट अनिवार्य", noPhone: "मोबाइल फोन नको", laneDiscipline: "लेन शिस्त अनिवार्य",
    tapToTransmit: "बोलण्यासाठी टॅप करा", listening: "ऐकत आहे...",
  },
  "kn-IN": {
    terminal: "ಟರ್ಮಿನಲ್", displayMode: "ಪ್ರದರ್ಶನ ಮೋಡ್",
    radar: "ರಾಡಾರ್", map: "ನಕ್ಷೆ", dashcam: "ಡ್ಯಾಷ್‌ಕ್ಯಾಮ್ AI",
    gpsTelemetry: "GPS ಟೆಲಿಮೆಟ್ರಿ", obdTelemetry: "OBD-II ಟೆಲಿಮೆಟ್ರಿ",
    speed: "ವೇಗ", limit: "ಮಿತಿ", kmh: "KM/H",
    connectObd: "OBD-II ಸಂಪರ್ಕಿಸಿ", obdLive: "OBD-II ಲೈವ್", connecting: "ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…",
    endTrip: "ಪ್ರಯಾಣ ಮುಗಿಸಿ", currentSpeed: "ಪ್ರಸ್ತುತ ವೇಗ",
    drivingAnalytics: "ಚಾಲನೆ ವಿಶ್ಲೇಷಣೆ", safetyScore: "ಸುರಕ್ಷತೆ ಸ್ಕೋರ್",
    excellent: "ಅತ್ಯುತ್ತಮ 😇", good: "ಒಳ್ಳೆಯದು 🛡️", needsWork: "ಸುಧಾರಣೆ ಬೇಕು ⚠️",
    violations: "ಸಕ್ರಿಯ ಕಾನೂನು ಉಲ್ಲಂಘನೆ",
    overspeedTitle: "ಅತಿ ವೇಗ ಪತ್ತೆಯಾಗಿದೆ",
    overspeedDesc: "ಸೆಕ್ಷನ್ 183 MVA. ದಂಡ ₹1,000–₹2,000. ತಕ್ಷಣ ನಿಧಾನಿಸಿ.",
    noViolations: "ಯಾವುದೇ ಉಲ್ಲಂಘನೆ ಇಲ್ಲ",
    noViolationsDesc: "ಪರಿಪೂರ್ಣ ಅನುಸರಣೆ. ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತಿದೆ...",
    compliance: "ಅನುಸರಣೆ ಪರಿಶೀಲನೆ //",
    seatbelt: "ಸೀಟ್‌ಬೆಲ್ಟ್ ಕಡ್ಡಾಯ", noPhone: "ಮೊಬೈಲ್ ಬೇಡ", laneDiscipline: "ಲೇನ್ ಶಿಸ್ತು ಅಗತ್ಯ",
    tapToTransmit: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ", listening: "ಆಲಿಸುತ್ತಿದ್ದೇನೆ...",
  },
  "bn-IN": {
    terminal: "টার্মিনাল", displayMode: "ডিসপ্লে মোড",
    radar: "রাডার", map: "মানচিত্র", dashcam: "ড্যাশক্যাম AI",
    gpsTelemetry: "GPS টেলিমেট্রি", obdTelemetry: "OBD-II টেলিমেট্রি",
    speed: "গতি", limit: "সীমা", kmh: "KM/H",
    connectObd: "OBD-II সংযুক্ত করুন", obdLive: "OBD-II লাইভ", connecting: "সংযুক্ত হচ্ছে…",
    endTrip: "যাত্রা শেষ করুন", currentSpeed: "বর্তমান গতি",
    drivingAnalytics: "ড্রাইভিং বিশ্লেষণ", safetyScore: "নিরাপত্তা স্কোর",
    excellent: "অসাধারণ 😇", good: "ভালো 🛡️", needsWork: "উন্নতি দরকার ⚠️",
    violations: "সক্রিয় আইন লঙ্ঘন",
    overspeedTitle: "অতিরিক্ত গতি সনাক্ত হয়েছে",
    overspeedDesc: "ধারা 183 MVA। জরিমানা ₹1,000–₹2,000। এখনই ধীর হন।",
    noViolations: "কোনো লঙ্ঘন নেই",
    noViolationsDesc: "পরিপূর্ণ সম্মতি। স্ক্যান চলছে...",
    compliance: "সম্মতি যাচাই //",
    seatbelt: "সিটবেল্ট বাধ্যতামূলক", noPhone: "মোবাইল নিষিদ্ধ", laneDiscipline: "লেন শৃঙ্খলা প্রয়োজনীয়",
    tapToTransmit: "কথা বলতে ট্যাপ করুন", listening: "শুনছি...",
  },
  "gu-IN": {
    terminal: "ટર્મિનલ", displayMode: "ડિસ્પ્લે મોડ",
    radar: "રડાર", map: "નકશો", dashcam: "ડૅશકૅમ AI",
    gpsTelemetry: "GPS ટેલિમેટ્રી", obdTelemetry: "OBD-II ટેલિમેટ્રી",
    speed: "ઝડપ", limit: "મર્યાદા", kmh: "KM/H",
    connectObd: "OBD-II જોડો", obdLive: "OBD-II લાઇવ", connecting: "જોડાઈ રહ્યું છે…",
    endTrip: "મુસાફરી સમાપ્ત", currentSpeed: "વર્તમાન ઝડપ",
    drivingAnalytics: "ડ્રાઇવિંગ વિશ્લેષણ", safetyScore: "સુરક્ષા સ્કોર",
    excellent: "ઉત્કૃષ્ટ 😇", good: "સારું 🛡️", needsWork: "સુધારો જરૂરી ⚠️",
    violations: "સક્રિય કાયદો ઉલ્લંઘન",
    overspeedTitle: "અતિ ઝડપ મળી",
    overspeedDesc: "કલમ 183 MVA. દંડ ₹1,000–₹2,000. તાત્કાલિક ધીમા પડો.",
    noViolations: "કોઈ ઉલ્લંઘન નથી",
    noViolationsDesc: "સંપૂર્ણ અનુપાલન. સ્કૅન થઈ રહ્યું છે...",
    compliance: "અનુપાલન ચકાસણી //",
    seatbelt: "સીટબેલ્ટ ફરજિયાત", noPhone: "મોબાઇલ ફોન નહીં", laneDiscipline: "લેન શિસ્ત ફરજિયાત",
    tapToTransmit: "બોલવા ટૅપ કરો", listening: "સાંભળી રહ્યો છું...",
  },
  "ta-IN": {
    terminal: "டெர்மினல்", displayMode: "காட்சி பயன்முறை",
    radar: "ரேடார்", map: "வரைபடம்", dashcam: "டாஷ்கேம் AI",
    gpsTelemetry: "GPS தொலைமானி", obdTelemetry: "OBD-II தொலைமானி",
    speed: "வேகம்", limit: "வரம்பு", kmh: "KM/H",
    connectObd: "OBD-II இணைக்கவும்", obdLive: "OBD-II நேரடி", connecting: "இணைக்கிறது…",
    endTrip: "பயணம் முடிக்கவும்", currentSpeed: "தற்போதைய வேகம்",
    drivingAnalytics: "ஓட்டுநர் பகுப்பாய்வு", safetyScore: "பாதுகாப்பு மதிப்பெண்",
    excellent: "சிறப்பானது 😇", good: "நல்லது 🛡️", needsWork: "மேம்பாடு தேவை ⚠️",
    violations: "செயலில் உள்ள சட்ட மீறல்கள்",
    overspeedTitle: "அதிவேகம் கண்டறியப்பட்டது",
    overspeedDesc: "பிரிவு 183 MVA. அபராதம் ₹1,000–₹2,000. உடனே வேகம் குறைக்கவும்.",
    noViolations: "மீறல்கள் இல்லை",
    noViolationsDesc: "முழுமையான இணக்கம். ஸ்கேன் ஆகிறது...",
    compliance: "இணக்க சோதனை //",
    seatbelt: "சீட்பெல்ட் கட்டாயம்", noPhone: "மொபைல் வேண்டாம்", laneDiscipline: "லேன் ஒழுக்கம் அவசியம்",
    tapToTransmit: "பேச தட்டவும்", listening: "கேட்கிறது...",
  },
  "te-IN": {
    terminal: "టెర్మినల్", displayMode: "డిస్ప్లే మోడ్",
    radar: "రాడార్", map: "మ్యాప్", dashcam: "డాష్‌కామ్ AI",
    gpsTelemetry: "GPS టెలిమెట్రీ", obdTelemetry: "OBD-II టెలిమెట్రీ",
    speed: "వేగం", limit: "పరిమితి", kmh: "KM/H",
    connectObd: "OBD-II కనెక్ట్ చేయండి", obdLive: "OBD-II లైవ్", connecting: "కనెక్ట్ అవుతోంది…",
    endTrip: "ప్రయాణం ముగించండి", currentSpeed: "ప్రస్తుత వేగం",
    drivingAnalytics: "డ్రైవింగ్ విశ్లేషణ", safetyScore: "భద్రతా స్కోర్",
    excellent: "అద్భుతం 😇", good: "మంచిది 🛡️", needsWork: "మెరుగుదల అవసరం ⚠️",
    violations: "క్రియాశీల చట్ట ఉల్లంఘనలు",
    overspeedTitle: "అధిక వేగం గుర్తించబడింది",
    overspeedDesc: "సెక్షన్ 183 MVA. జరిమానా ₹1,000–₹2,000. వెంటనే నెమ్మదించండి.",
    noViolations: "ఉల్లంఘనలు లేవు",
    noViolationsDesc: "పూర్తి సమ్మతి. స్కాన్ జరుగుతోంది...",
    compliance: "సమ్మతి తనిఖీ //",
    seatbelt: "సీట్‌బెల్ట్ తప్పనిసరి", noPhone: "మొబైల్ ఫోన్ వద్దు", laneDiscipline: "లేన్ క్రమశిక్షణ అవసరం",
    tapToTransmit: "మాట్లాడటానికి నొక్కండి", listening: "వింటున్నాను...",
  },
};

// ── Summary/Post-Drive UI strings (all 8 languages) ──
export const summaryTranslations: Record<string, any> = {
  "en-IN": {
    systemLive: "System Live", backHome: "Back Home", missionComplete: "MISSION COMPLETE",
    postDriveSummary: "Post-Drive Summary", driverPerformance: "Driver Performance Index",
    eliteDriver: "Elite Driver", safeDriver: "Safe Driver", highRisk: "High Risk",
    peakVelocity: "Peak Velocity", systemAlerts: "System Alerts", echallanPortal: "Vehicle E-Challan Portal",
    echallanDesc: "Check if your vehicle has any pending traffic violations from previous drives.",
    run: "RUN", cleanRecord: "Clean Record", settle: "Settle",
    assessmentMatrix: "Predictive Assessment Matrix", estimatedLiability: "Estimated Liability"
  },
  "hi-IN": {
    systemLive: "सिस्टम लाइव", backHome: "वापस होम", missionComplete: "मिशन पूरा हुआ",
    postDriveSummary: "यात्रा का सारांश", driverPerformance: "ड्राइवर प्रदर्शन इंडेक्स",
    eliteDriver: "उत्कृष्ट ड्राइवर", safeDriver: "सुरक्षित ड्राइवर", highRisk: "उच्च जोखिम",
    peakVelocity: "अधिकतम गति", systemAlerts: "सिस्टम अलर्ट", echallanPortal: "वाहन ई-चालान पोर्टल",
    echallanDesc: "जांचें कि क्या आपके वाहन पर पिछली यात्राओं से कोई लंबित ट्रैफिक उल्लंघन है।",
    run: "चलाएं", cleanRecord: "स्वच्छ रिकॉर्ड", settle: "भुगतान करें",
    assessmentMatrix: "अनुमानित मूल्यांकन मैट्रिक्स", estimatedLiability: "अनुमानित देयता"
  },
  "mr-IN": {
    systemLive: "सिस्टम लाइव्ह", backHome: "होमवर परत", missionComplete: "मिशन पूर्ण",
    postDriveSummary: "प्रवासाचा सारांश", driverPerformance: "ड्रायव्हर कामगिरी निर्देशांक",
    eliteDriver: "उत्कृष्ट ड्रायव्हर", safeDriver: "सुरक्षित ड्रायव्हर", highRisk: "उच्च धोका",
    peakVelocity: "कमाल वेग", systemAlerts: "सिस्टम अलर्ट", echallanPortal: "वाहन ई-चलान पोर्टल",
    echallanDesc: "मागील प्रवासातील तुमच्या वाहनावर कोणतेही प्रलंबित रहदारी उल्लंघन आहे का ते तपासा.",
    run: "चालवा", cleanRecord: "स्वच्छ रेकॉर्ड", settle: "पैसे द्या",
    assessmentMatrix: "अंदाज मूल्यमापन मॅट्रिक्स", estimatedLiability: "अंदाजित दायित्व"
  },
  "kn-IN": {
    systemLive: "ಸಿಸ್ಟಮ್ ಲೈವ್", backHome: "ಹೋಮ್‌ಗೆ ಹಿಂತಿರುಗಿ", missionComplete: "ಮಿಷನ್ ಪೂರ್ಣಗೊಂಡಿದೆ",
    postDriveSummary: "ಪ್ರಯಾಣದ ಸಾರಾಂಶ", driverPerformance: "ಚಾಲಕ ಕಾರ್ಯಕ್ಷಮತೆ ಸೂಚ್ಯಂಕ",
    eliteDriver: "ಉತ್ತಮ ಚಾಲಕ", safeDriver: "ಸುರಕ್ಷಿತ ಚಾಲಕ", highRisk: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
    peakVelocity: "ಗರಿಷ್ಠ ವೇಗ", systemAlerts: "ಸಿಸ್ಟಮ್ ಎಚ್ಚರಿಕೆಗಳು", echallanPortal: "ವಾಹನ ಇ-ಚಲನ್ ಪೋರ್ಟಲ್",
    echallanDesc: "ಹಿಂದಿನ ಪ್ರಯಾಣಗಳಿಂದ ನಿಮ್ಮ ವಾಹನವು ಯಾವುದೇ ಬಾಕಿ ಉಳಿದಿರುವ ಸಂಚಾರ ಉಲ್ಲಂಘನೆಗಳನ್ನು ಹೊಂದಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
    run: "ಚಲಾಯಿಸಿ", cleanRecord: "ಸ್ವಚ್ಛ ದಾಖಲೆ", settle: "ಪಾವತಿಸಿ",
    assessmentMatrix: "ಮುನ್ಸೂಚಕ ಮೌಲ್ಯಮಾಪನ ಮ್ಯಾಟ್ರಿಕ್ಸ್", estimatedLiability: "ಅಂದಾಜು ಹೊಣೆಗಾರಿಕೆ"
  },
  "bn-IN": {
    systemLive: "সিস্টেম লাইভ", backHome: "হোমে ফিরে যান", missionComplete: "মিশন সম্পূর্ণ",
    postDriveSummary: "পোস্ট-ড্রাইভ সারাংশ", driverPerformance: "ড্রাইভার কর্মক্ষমতা সূচক",
    eliteDriver: "এলিট ড্রাইভার", safeDriver: "নিরাপদ ড্রাইভার", highRisk: "উচ্চ ঝুঁকি",
    peakVelocity: "সর্বোচ্চ বেগ", systemAlerts: "সিস্টেম সতর্কতা", echallanPortal: "যানবাহন ই-চালান পোর্টাল",
    echallanDesc: "পূর্ববর্তী ড্রাইভগুলি থেকে আপনার গাড়িতে কোনও মুলতুবি ট্র্যাফিক লঙ্ঘন আছে কিনা তা পরীক্ষা করুন।",
    run: "চালান", cleanRecord: "ক্লিন রেকর্ড", settle: "নিষ্পত্তি করুন",
    assessmentMatrix: "ভবিষ্যদ্বাণীমূলক মূল্যায়ন ম্যাট্রিক্স", estimatedLiability: "আনুমানিক দায়বদ্ধতা"
  },
  "gu-IN": {
    systemLive: "સિસ્ટમ લાઇવ", backHome: "હોમ પર પાછા", missionComplete: "મિશન પૂર્ણ",
    postDriveSummary: "પોસ્ટ-ડ્રાઇવ સારાંશ", driverPerformance: "ડ્રાઇવર પ્રદર્શન ઇન્ડેક્સ",
    eliteDriver: "એલિટ ડ્રાઇવર", safeDriver: "સલામત ડ્રાઇવર", highRisk: "ઉચ્ચ જોખમ",
    peakVelocity: "મહત્તમ ઝડપ", systemAlerts: "સિસ્ટમ ચેતવણીઓ", echallanPortal: "વાહન ઇ-ચલન પોર્ટલ",
    echallanDesc: "તપાસો કે તમારા વાહન પર અગાઉની ડ્રાઇવ્સમાંથી કોઈ બાકી ટ્રાફિક ઉલ્લંઘન છે કે નહીં.",
    run: "ચલાવો", cleanRecord: "સ્વચ્છ રેકોર્ડ", settle: "પતાવટ કરો",
    assessmentMatrix: "આગાહીયુક્ત મૂલ્યાંકન મેટ્રિક્સ", estimatedLiability: "અંદાજિત જવાબદારી"
  },
  "ta-IN": {
    systemLive: "சிஸ்டம் நேரலை", backHome: "முகப்புக்குத் திரும்பு", missionComplete: "பணி முடிந்தது",
    postDriveSummary: "பயண சுருக்கம்", driverPerformance: "ஓட்டுநர் செயல்திறன் குறியீடு",
    eliteDriver: "சிறந்த ஓட்டுநர்", safeDriver: "பாதுகாப்பான ஓட்டுநர்", highRisk: "அதிக ஆபத்து",
    peakVelocity: "அதிகபட்ச வேகம்", systemAlerts: "கணினி எச்சரிக்கைகள்", echallanPortal: "வாகன இ-சலான் போர்ட்டல்",
    echallanDesc: "முந்தைய பயணங்களில் இருந்து உங்கள் வாகனத்தில் நிலுவையில் உள்ள போக்குவரத்து விதிமீறல்கள் உள்ளதா எனச் சரிபார்க்கவும்.",
    run: "இயக்கு", cleanRecord: "சுத்தமான பதிவு", settle: "செலுத்து",
    assessmentMatrix: "முன்கணிப்பு மதிப்பீட்டு அணி", estimatedLiability: "மதிப்பிடப்பட்ட பொறுப்பு"
  },
  "te-IN": {
    systemLive: "సిస్టమ్ లైవ్", backHome: "హోమ్‌కు తిరిగి వెళ్లండి", missionComplete: "మిషన్ పూర్తయింది",
    postDriveSummary: "పోస్ట్-డ్రైవ్ సారాంశం", driverPerformance: "డ్రైవర్ పనితీరు సూచిక",
    eliteDriver: "ఎలైట్ డ్రైవర్", safeDriver: "సురక్షిత డ్రైవర్", highRisk: "అధిక ప్రమాదం",
    peakVelocity: "గరిష్ట వేగం", systemAlerts: "సిస్టమ్ హెచ్చరికలు", echallanPortal: "వాహన ఇ-చలాన్ పోర్టల్",
    echallanDesc: "మునుపటి ప్రయాణాల నుండి మీ వాహనంలో ఏవైనా పెండింగ్ ట్రాఫిక్ ఉల్లంఘనలు ఉన్నాయా అని తనిఖీ చేయండి.",
    run: "రన్", cleanRecord: "క్లీన్ రికార్డ్", settle: "చెల్లించండి",
    assessmentMatrix: "ప్రిడిక్టివ్ అసెస్‌మెంట్ మ్యాట్రిక్స్", estimatedLiability: "అంచనా వేయబడిన బాధ్యత"
  }
};
