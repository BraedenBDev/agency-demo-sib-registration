// AI Event Registration Module (Offline)
// QR text format MUST match main system parser:
// adult,first,last,phone,email,age_range,nationality,emirate
// child,parent_first,parent_last,phone,email,nationality,emirate, child_name,child_age_range, ... , [parent_participant,parent_age_range]

// Adult ranges = the ones used in public/index.html
const ADULT_AGE_RANGES = ["18-20","21-25","26-30","31-35","36-40","41-45","46-50","51+"];

// Child ranges = the ones used in public/index.html
const CHILD_AGE_RANGES = ["0-2","3-5","6-8","9-12","13-17"];

const EMIRATES = ["Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah"];

// Nationalities = demonyms list (like Registration)
const NATIONALITIES = [
  "Afghan","Albanian","Algerian","American","Andorran","Angolan","Argentine","Armenian","Australian","Austrian",
  "Azerbaijani","Bahraini","Bangladeshi","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese",
  "Bolivian","Bosnian","Botswanan","Brazilian","British","Bruneian","Bulgarian","Burkinabe","Burmese","Burundian",
  "Cambodian","Cameroonian","Canadian","Cape Verdean","Central African","Chadian","Chilean","Chinese","Colombian",
  "Comoran","Congolese","Costa Rican","Croatian","Cuban","Cypriot","Czech","Danish","Djiboutian","Dominican",
  "Dutch","Ecuadorian","Egyptian","Emirati","Equatorial Guinean","Eritrean","Estonian","Ethiopian","Fijian","Filipino",
  "Finnish","French","Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean",
  "Guyanese","Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli",
  "Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakh","Kenyan","Kuwaiti","Kyrgyz","Laotian","Latvian",
  "Lebanese","Liberian","Libyan","Liechteniner","Lithuanian","Luxembourger","Macedonian","Malagasy","Malawian",
  "Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Moldovan","Monacan","Mongolian",
  "Montenegrin","Moroccan","Mozambican","Namibian","Nepalese","New Zealander","Nicaraguan","Nigerien","Nigerian",
  "North Korean","Norwegian","Omani","Pakistani","Palestinian","Panamanian","Paraguayan","Peruvian","Polish",
  "Portuguese","Qatari","Romanian","Russian","Rwandan","Saudi","Scottish","Senegalese","Serbian","Seychellois",
  "Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African","South Korean","Spanish","Sri Lankan",
  "Sudanese","Swedish","Swiss","Syrian","Taiwanese","Tajik","Tanzanian","Thai","Togolese","Tongan","Tunisian",
  "Turkish","Turkmen","Ugandan","Ukrainian","Uruguayan","Uzbek","Venezuelan","Vietnamese","Welsh","Yemeni","Zambian","Zimbabwean"
];

const msg = document.getElementById("msg");
const adultTab = document.getElementById("adultTab");
const childTab = document.getElementById("childTab");
const adultForm = document.getElementById("adultForm");
const childForm = document.getElementById("childForm");
const termsCheck = document.getElementById("termsCheck");
const termsLink = document.getElementById("termsLink");
const termsModal = document.getElementById("termsModal");
const termsCloseBtn = document.getElementById("termsCloseBtn");

const generateAdultBtn = document.getElementById("generateAdultBtn");
const generateChildBtn = document.getElementById("generateChildBtn");
const clearBtn = document.getElementById("clearBtn");

const aFirst = document.getElementById("a_first");
const aLast = document.getElementById("a_last");
const aPhone = document.getElementById("a_phone");
const aEmail = document.getElementById("a_email");
const aAge = document.getElementById("a_age");
const aNat = document.getElementById("a_nat");
const aEmir = document.getElementById("a_emir");
const aNatSearch = document.getElementById("a_nat_search");
const aNatList = document.getElementById("a_nat_list");

const pFirst = document.getElementById("p_first");
const pLast = document.getElementById("p_last");
const pPhone = document.getElementById("p_phone");
const pEmail = document.getElementById("p_email");
const pNat = document.getElementById("p_nat");
const pEmir = document.getElementById("p_emir");
const pNatSearch = document.getElementById("p_nat_search");
const pNatList = document.getElementById("p_nat_list");
const parentParticipant = document.getElementById("parent_participant");
const parentAge = document.getElementById("parent_age");

const aPhoneHelp = document.getElementById("a_phone_help");
const pPhoneHelp = document.getElementById("p_phone_help");

const UAE_PHONE_REGEX = /^05\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L} ]+$/u;

function setMsg(text, type="good") {
  msg.textContent = text || "";
  msg.className = type === "good" ? "good" : type === "warn" ? "warn" : "bad";
}

function setFieldError(el) {
  if (!el) return;
  el.classList.add("inputError");
}

function clearFieldErrors() {
  document.querySelectorAll(".inputError").forEach(el => el.classList.remove("inputError"));
  if (aPhoneHelp) aPhoneHelp.textContent = "Format: 05X XXX XXXX";
  if (pPhoneHelp) pPhoneHelp.textContent = "Format: 05X XXX XXXX";
}

function fillSelect(selectEl, values, placeholder="- Select -") {
  selectEl.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  selectEl.appendChild(opt0);
  for (const v of values) {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    selectEl.appendChild(o);
  }
}

function matchesFuzzy(text, query) {
  if (!query) return true;
  const t = String(text || "").toLowerCase();
  const q = String(query || "").toLowerCase().replace(/\s+/g, "");
  let i = 0;
  for (const ch of q) {
    i = t.indexOf(ch, i);
    if (i === -1) return false;
    i += 1;
  }
  return true;
}

function filterSelect(selectEl, values, query, placeholder="- Select -") {
  const current = selectEl.value;
  const filtered = values.filter(v => matchesFuzzy(v, query));
  fillSelect(selectEl, filtered, placeholder);
  if (filtered.includes(current)) selectEl.value = current;
}

function bindNatSearch(searchEl, listEl, selectEl, values) {
  if (!searchEl || !listEl || !selectEl) return;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  if (!isMobile) {
    listEl.style.display = "none";
    return;
  }

  const renderList = (show = true) => {
    const query = searchEl.value;
    const filtered = values.filter(v => matchesFuzzy(v, query));
    listEl.innerHTML = "";
    for (const v of filtered) {
      const item = document.createElement("div");
      item.className = "natItem";
      item.textContent = v;
      item.onclick = () => {
        selectEl.value = v;
        searchEl.value = v;
        listEl.style.display = "none";
      };
      listEl.appendChild(item);
    }
    listEl.style.display = show ? "block" : "none";
  };

  searchEl.addEventListener("input", () => renderList(true));
  searchEl.addEventListener("focus", () => renderList(true));
  searchEl.addEventListener("click", () => renderList(true));
  searchEl.addEventListener("blur", () => {
    setTimeout(() => { listEl.style.display = "none"; }, 150);
  });

  renderList(false);
}

function switchMode(mode) {
  if (mode === "adult") {
    adultTab.classList.add("active");
    childTab.classList.remove("active");
    adultForm.style.display = "block";
    childForm.style.display = "none";
    if (generateAdultBtn) generateAdultBtn.style.display = "block";
    if (generateChildBtn) generateChildBtn.style.display = "none";
  } else {
    childTab.classList.add("active");
    adultTab.classList.remove("active");
    adultForm.style.display = "none";
    childForm.style.display = "block";
    if (generateAdultBtn) generateAdultBtn.style.display = "none";
    if (generateChildBtn) generateChildBtn.style.display = "block";
  }
  setMsg("");
  clearFieldErrors();
}

adultTab.onclick = () => switchMode("adult");
childTab.onclick = () => switchMode("child");

// Init selects
fillSelect(aAge, ADULT_AGE_RANGES);
fillSelect(parentAge, ADULT_AGE_RANGES);
fillSelect(aNat, NATIONALITIES);
fillSelect(pNat, NATIONALITIES);
fillSelect(aEmir, EMIRATES);
fillSelect(pEmir, EMIRATES);
bindNatSearch(aNatSearch, aNatList, aNat, NATIONALITIES);
bindNatSearch(pNatSearch, pNatList, pNat, NATIONALITIES);

const childrenWrap = document.getElementById("childrenWrap");

function applyNameFilter(input) {
  input.addEventListener("input", () => {
    const cleaned = input.value.replace(/[^\p{L} ]/gu, "");
    if (cleaned !== input.value) input.value = cleaned;
  });
}

function normalizePhone(val) {
  const raw = String(val || "");
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("971") && digits.length >= 11) {
    return "0" + digits.slice(3, 12);
  }
  if (digits.length === 9 && digits.startsWith("5")) {
    return "0" + digits;
  }
  if (digits.startsWith("05")) {
    return digits.slice(0, 10);
  }
  return digits.slice(0, 10);
}

function applyPhoneFilter(input, helperEl) {
  input.addEventListener("input", () => {
    const cleaned = normalizePhone(input.value);
    if (cleaned !== input.value) input.value = cleaned;
    if (cleaned.length && !UAE_PHONE_REGEX.test(cleaned)) {
      helperEl.textContent = "Phone must be 10 digits and start with 05";
    } else {
      helperEl.textContent = "Format: 05X XXX XXXX";
    }
  });
  input.addEventListener("blur", () => {
    const cleaned = normalizePhone(input.value);
    if (cleaned !== input.value) input.value = cleaned;
  });
}

function makeChildRow() {
  const div = document.createElement("div");
  div.className = "row childRow";
  div.innerHTML = `
    <div class="field">
      <label>Child Name *</label>
      <input class="c_name" placeholder="Child name" />
    </div>
    <div class="field">
      <label>Child Age Range *</label>
      <select class="c_age"></select>
    </div>
    <div>
      <button type="button" class="removeChildBtn iconBtn" aria-label="Remove child">−</button>
    </div>
  `;
  const sel = div.querySelector(".c_age");
  fillSelect(sel, CHILD_AGE_RANGES);
  const nameInput = div.querySelector(".c_name");
  applyNameFilter(nameInput);
  div.querySelector(".removeChildBtn").onclick = () => div.remove();
  return div;
}

function addChild() { childrenWrap.appendChild(makeChildRow()); }
document.getElementById("addChildBtn").onclick = addChild;
addChild(); // default 1 row

function required(val) { return String(val || "").trim(); }

// Because QR parsing uses commas, prevent commas inside fields
function safeField(val) {
  return required(val).replace(/,/g, " ");
}

function isNameValid(val) {
  if (!val) return false;
  return NAME_REGEX.test(val);
}

function isEmailValid(val) {
  if (!val) return false;
  return EMAIL_REGEX.test(val);
}

function isPhoneValid(val) {
  return UAE_PHONE_REGEX.test(val || "");
}

function openQrPage(text) {
  sessionStorage.setItem("qr_payload", text);
  const w = window.open("qr.html", "_blank");
  if (!w) {
    setMsg("Popup blocked. Please allow popups to open the QR page.", "warn");
  }
}

function requireTerms() {
  if (!termsCheck || termsCheck.checked) return true;
  setMsg("Please agree to the Terms & Conditions before generating the QR.", "bad");
  return false;
}

function validateAdult() {
  clearFieldErrors();
  const first = safeField(aFirst.value);
  const last = safeField(aLast.value);
  const phone = normalizePhone(aPhone.value);
  const email = safeField(aEmail.value);
  const age = required(aAge.value);
  const nat = required(aNat.value);
  const emir = required(aEmir.value);

  if (!first) { setFieldError(aFirst); return { ok: false, message: "First name is required." }; }
  if (!isNameValid(first)) { setFieldError(aFirst); return { ok: false, message: "First name must contain letters only." }; }

  if (!last) { setFieldError(aLast); return { ok: false, message: "Last name is required." }; }
  if (!isNameValid(last)) { setFieldError(aLast); return { ok: false, message: "Last name must contain letters only." }; }

  if (!phone) { setFieldError(aPhone); return { ok: false, message: "Phone number is required." }; }
  if (!isPhoneValid(phone)) {
    setFieldError(aPhone);
    if (aPhoneHelp) aPhoneHelp.textContent = "Phone must be 10 digits and start with 05";
    return { ok: false, message: "Phone format must be 05X XXX XXXX." };
  }

  if (!email) { setFieldError(aEmail); return { ok: false, message: "Email is required." }; }
  if (!isEmailValid(email)) { setFieldError(aEmail); return { ok: false, message: "Email format is not valid." }; }

  if (!age) { setFieldError(aAge); return { ok: false, message: "Please select an age range." }; }
  if (!nat) { setFieldError(aNat); return { ok: false, message: "Please select a nationality." }; }
  if (!emir) { setFieldError(aEmir); return { ok: false, message: "Please select an emirate." }; }

  return { ok: true, data: { first, last, phone, email, age, nat, emir } };
}

function validateChild() {
  clearFieldErrors();
  const first = safeField(pFirst.value);
  const last = safeField(pLast.value);
  const phone = normalizePhone(pPhone.value);
  const email = safeField(pEmail.value);
  const nat = required(pNat.value);
  const emir = required(pEmir.value);

  if (!first) { setFieldError(pFirst); return { ok: false, message: "Parent first name is required." }; }
  if (!isNameValid(first)) { setFieldError(pFirst); return { ok: false, message: "Parent first name must contain letters only." }; }

  if (!last) { setFieldError(pLast); return { ok: false, message: "Parent last name is required." }; }
  if (!isNameValid(last)) { setFieldError(pLast); return { ok: false, message: "Parent last name must contain letters only." }; }

  if (!phone) { setFieldError(pPhone); return { ok: false, message: "Parent phone is required." }; }
  if (!isPhoneValid(phone)) {
    setFieldError(pPhone);
    if (pPhoneHelp) pPhoneHelp.textContent = "Phone must be 10 digits and start with 05";
    return { ok: false, message: "Parent phone format must be 05X XXX XXXX." };
  }

  if (!email) { setFieldError(pEmail); return { ok: false, message: "Parent email is required." }; }
  if (!isEmailValid(email)) { setFieldError(pEmail); return { ok: false, message: "Parent email format is not valid." }; }

  if (!nat) { setFieldError(pNat); return { ok: false, message: "Please select a nationality." }; }
  if (!emir) { setFieldError(pEmir); return { ok: false, message: "Please select an emirate." }; }

  const children = Array.from(document.querySelectorAll("#childrenWrap .row")).map(r => ({
    row: r,
    nameEl: r.querySelector(".c_name"),
    ageEl: r.querySelector(".c_age"),
    name: safeField(r.querySelector(".c_name").value),
    age: required(r.querySelector(".c_age").value)
  }));

  const cleaned = children.filter(c => c.name || c.age);
  if (!cleaned.length) {
    return { ok: false, message: "Please add at least one child." };
  }

  for (let i = 0; i < cleaned.length; i++) {
    const child = cleaned[i];
    if (!child.name) { setFieldError(child.nameEl); return { ok: false, message: `Child ${i + 1} name is required.` }; }
    if (!isNameValid(child.name)) { setFieldError(child.nameEl); return { ok: false, message: `Child ${i + 1} name must contain letters only.` }; }
    if (!child.age) { setFieldError(child.ageEl); return { ok: false, message: `Child ${i + 1} age range is required.` }; }
  }

  const parent_participant = parentParticipant.value === "yes";
  const parent_age_range = required(parentAge.value);
  if (parent_participant && !parent_age_range) {
    setFieldError(parentAge);
    return { ok: false, message: "Please select parent age range." };
  }

  return {
    ok: true,
    data: { pFirst: first, pLast: last, pPhone: phone, pEmail: email, nat, emir, children: cleaned, parent_participant, parent_age_range }
  };
}

function buildAdultQr(d) {
  return ["adult", d.first, d.last, d.phone, d.email, d.age, d.nat, d.emir].join(",");
}

function buildChildQr(d) {
  const parts = ["child", d.pFirst, d.pLast, d.pPhone, d.pEmail, d.nat, d.emir];
  for (const c of d.children) parts.push(c.name, c.age);

  if (d.parent_participant) {
    parts.push("parent_participant");
    parts.push(d.parent_age_range);
  }
  return parts.join(",");
}

generateAdultBtn.onclick = () => {
  setMsg("");
  const v = validateAdult();
  if (!v.ok) return setMsg(v.message, "bad");
  if (!requireTerms()) return;
  const text = buildAdultQr(v.data);
  openQrPage(text);
  setMsg("QR opened in a new page.", "good");
};

generateChildBtn.onclick = () => {
  setMsg("");
  const v = validateChild();
  if (!v.ok) return setMsg(v.message, "bad");
  if (!requireTerms()) return;
  const text = buildChildQr(v.data);
  openQrPage(text);
  setMsg("QR opened in a new page.", "good");
};

clearBtn.onclick = () => {
  setMsg("");
  clearFieldErrors();

  // Clear adult
  ["a_first","a_last","a_phone","a_email"].forEach(id => document.getElementById(id).value = "");
  aAge.value = "";
  aNat.value = "";
  aEmir.value = "";

  // Clear child
  ["p_first","p_last","p_phone","p_email"].forEach(id => document.getElementById(id).value = "");
  pNat.value = "";
  pEmir.value = "";
  parentParticipant.value = "no";
  parentAge.value = "";
  childrenWrap.innerHTML = "";
  addChild();

  // Default Adult
  switchMode("adult");
};

if (termsLink && termsModal) {
  termsLink.onclick = () => { termsModal.style.display = "flex"; };
}
if (termsCloseBtn && termsModal) {
  termsCloseBtn.onclick = () => { termsModal.style.display = "none"; };
}
if (termsModal) {
  termsModal.addEventListener("click", (e) => {
    if (e.target === termsModal) termsModal.style.display = "none";
  });
}

// Input filters
[aFirst, aLast, pFirst, pLast].forEach(applyNameFilter);
applyPhoneFilter(aPhone, aPhoneHelp);
applyPhoneFilter(pPhone, pPhoneHelp);

// Default mode = Adult
switchMode("adult");
