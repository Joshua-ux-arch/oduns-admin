import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPok0kq7klqcJG1z6A0oE9RZkpLdPTTto",
  authDomain: "oduns-7f07a.firebaseapp.com",
  projectId: "oduns-7f07a",
  storageBucket: "oduns-7f07a.firebasestorage.app",
  messagingSenderId: "159165548435",
  appId: "1:159165548435:web:638cfeb13c965f08118a66"
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const auth    = getAuth(app);
const MENU_DOC = doc(db, "restaurant", "menu");

const CLOUDINARY_CLOUD  = "dhjknh0to";
const CLOUDINARY_PRESET = "f3gynupo";
const fmt = n => "₦" + Number(n).toLocaleString("en-NG");

const DEFAULT_MENU = {
  food:{ label:"Food", emoji:"🍽️", items:[
    {id:101,name:"Party Jollof Rice",      amount:12500,tag:"Bestseller",  available:true,img:"",desc:"Smoky firewood jollof, slow-cooked with seasoned grilled chicken & fried plantain"},
    {id:102,name:"Fried Rice & Chicken",   amount:11000,tag:"Classic",     available:true,img:"",desc:"Fluffy Nigerian fried rice loaded with vegetables, liver & crispy fried chicken"},
    {id:103,name:"White Rice & Stew",      amount:8500, tag:"Comfort",     available:true,img:"",desc:"Steamed long-grain rice with rich tomato beef stew & side salad"},
    {id:104,name:"Ofada Rice & Ayamase",   amount:13500,tag:"Local Fav",   available:true,img:"",desc:"Local ofada rice with spicy ayamase green pepper stew"},
    {id:105,name:"Beans & Plantain",       amount:6500, tag:"Vegan",       available:true,img:"",desc:"Seasoned brown beans with palm oil, crayfish & ripe fried plantain"},
    {id:106,name:"Moi Moi (3 wraps)",      amount:5000, tag:"Steamed",     available:true,img:"",desc:"Steamed bean pudding with egg, fish & crayfish in banana leaves"},
    {id:107,name:"Beef Suya Platter",      amount:15000,tag:"Must Try",    available:true,img:"",desc:"Thinly sliced beef in yaji spice, charcoal-grilled with onions & tomatoes"},
    {id:108,name:"Pepper Soup (Goat)",     amount:14000,tag:"Spicy",       available:true,img:"",desc:"Aromatic goat meat in a fiery clear broth with utazi & uziza"},
    {id:109,name:"Pepper Soup (Catfish)",  amount:16000,tag:"Spicy",       available:true,img:"",desc:"Fresh catfish in a bold fragrant pepper soup broth"},
    {id:110,name:"Asun (Spicy Goat)",      amount:13000,tag:"Smoky",       available:true,img:"",desc:"Smoked spicy goat meat, fire-roasted & tossed with peppers & onions"},
  ]},
  swallow:{ label:"Swallow & Soups", emoji:"🫙", items:[
    {id:201,name:"Pounded Yam & Egusi",      amount:18000,tag:"Signature",    available:true,img:"",desc:"Hand-pounded yam with rich egusi soup, assorted meat & stockfish"},
    {id:202,name:"Pounded Yam & Ogbono",     amount:18000,tag:"Draw Soup",    available:true,img:"",desc:"Pounded yam with ogbono draw soup, beef, tripe & smoked fish"},
    {id:203,name:"Pounded Yam & Ofe Onugbu", amount:18500,tag:"Igbo Special", available:true,img:"",desc:"Pounded yam with bitter leaf soup, goat meat & stockfish"},
    {id:204,name:"Pounded Yam & Oha Soup",   amount:19000,tag:"Seasonal",     available:true,img:"",desc:"Pounded yam with oha leaf soup, assorted meats & cocoyam"},
    {id:205,name:"Eba & Egusi Soup",          amount:15000,tag:"Classic",      available:true,img:"",desc:"Golden garri eba with chunky egusi soup & assorted meat"},
    {id:206,name:"Eba & Ogbono Soup",         amount:15000,tag:"Draw Soup",    available:true,img:"",desc:"Firm eba with rich ogbono soup, goat meat & smoked fish"},
    {id:207,name:"Fufu & Egusi Soup",         amount:16000,tag:"Soft",         available:true,img:"",desc:"Stretchy fufu with deeply flavoured egusi soup & assorted meat"},
    {id:208,name:"Fufu & Okra Soup",          amount:16000,tag:"Fresh",        available:true,img:"",desc:"Smooth fufu with fresh okra soup, assorted meat & periwinkle"},
    {id:209,name:"Amala & Ewedu",             amount:14000,tag:"Yoruba Fav",   available:true,img:"",desc:"Dark yam amala with ewedu draw soup & gbegiri"},
    {id:210,name:"Amala & Abula",             amount:15500,tag:"Premium",      available:true,img:"",desc:"Amala with ewedu, gbegiri & rich buka stew with assorted meat"},
    {id:211,name:"Semolina & Veg Soup",       amount:14500,tag:"Fresh",        available:true,img:"",desc:"Smooth semolina with mixed vegetable soup & assorted protein"},
    {id:212,name:"Wheat & Oha Soup",          amount:16000,tag:"Healthy",      available:true,img:"",desc:"Whole wheat swallow with oha leaf soup & assorted meats"},
  ]},
  snacks:{ label:"Snacks", emoji:"🍟", items:[
    {id:301,name:"Puff Puff (10 pcs)",   amount:3500, tag:"Fried",      available:true,img:"",desc:"Hot golden puff puff dusted with cinnamon sugar"},
    {id:302,name:"Chin Chin (Pack)",      amount:2500, tag:"Crunchy",    available:true,img:"",desc:"Crispy fried chin chin, sweet & lightly spiced"},
    {id:303,name:"Spring Rolls (6 pcs)", amount:5000, tag:"Crispy",     available:true,img:"",desc:"Crispy rolls stuffed with spiced minced meat & vegetables"},
    {id:304,name:"Samosa (6 pcs)",        amount:5000, tag:"Crispy",     available:true,img:"",desc:"Flaky pastry pockets filled with seasoned chicken & potatoes"},
    {id:305,name:"Scotch Eggs (2 pcs)",   amount:4500, tag:"Classic",    available:true,img:"",desc:"Boiled eggs wrapped in seasoned minced meat, deep fried golden"},
    {id:306,name:"Gizdodo",               amount:6500, tag:"Fan Fav",    available:true,img:"",desc:"Fried gizzard & plantain tossed in spicy pepper sauce"},
    {id:307,name:"Peppered Gizzard",      amount:7000, tag:"Spicy",      available:true,img:"",desc:"Tender gizzard slow-cooked in thick peppered tomato sauce"},
    {id:308,name:"Small Chops Platter",   amount:12000,tag:"Party Pack", available:true,img:"",desc:"Assorted: puff puff, spring rolls, samosa, gizzard & fish roll"},
    {id:309,name:"Meatpie (2 pcs)",       amount:3000, tag:"Baked",      available:true,img:"",desc:"Flaky shortcrust pastry filled with minced meat & carrots"},
    {id:310,name:"Fish Roll (2 pcs)",     amount:3000, tag:"Classic",    available:true,img:"",desc:"Crispy pastry rolls filled with spiced mackerel fish"},
  ]},
  drinks:{ label:"Drinks", emoji:"🥤", items:[
    {id:401,name:"Zobo (Chilled)",       amount:2000,tag:"Signature",   available:true,img:"",desc:"House-made hibiscus zobo with ginger, cloves & fruit slices"},
    {id:402,name:"Kunu (Spiced)",        amount:2000,tag:"Traditional", available:true,img:"",desc:"Creamy spiced millet & ginger kunu, lightly sweetened"},
    {id:403,name:"Chapman",              amount:3500,tag:"Classic",     available:true,img:"",desc:"Nigerian Chapman — Fanta, Sprite, grenadine, cucumber & bitters"},
    {id:404,name:"Watermelon Juice",     amount:3000,tag:"Fresh",       available:true,img:"",desc:"Freshly blended watermelon juice, no added sugar"},
    {id:405,name:"Pineapple Juice",      amount:3000,tag:"Fresh",       available:true,img:"",desc:"Cold-pressed pineapple juice with a hint of ginger"},
    {id:406,name:"Yoghurt Smoothie",     amount:3500,tag:"Healthy",     available:true,img:"",desc:"Blended smoothie with yoghurt, banana, strawberry & honey"},
    {id:407,name:"Soft Drink (Bottle)",  amount:700, tag:"Cold",        available:true,img:"",desc:"Coke, Fanta, Sprite, Pepsi — ice cold"},
    {id:408,name:"Malta Guinness",       amount:800, tag:"Cold",        available:true,img:"",desc:"Ice cold Malta Guinness — sweet, rich & malty"},
    {id:409,name:"Water (500ml)",        amount:300, tag:"Still",       available:true,img:"",desc:"Chilled table water"},
    {id:410,name:"Water (1.5L)",         amount:600, tag:"Still",       available:true,img:"",desc:"Large chilled table water"},
  ]},
};

const EMPTY_ITEM = {name:"",amount:"",tag:"",desc:"",available:true,img:""};

export default function App() {
  const [user,        setUser]        = useState(undefined);
  const [email,       setEmail]       = useState("");
  const [pass,        setPass]        = useState("");
  const [authErr,     setAuthErr]     = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [menu,        setMenu]        = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState("food");
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [toast,       setToast]       = useState(null);
  const [editItem,    setEditItem]    = useState(null);
  const [addingTo,    setAddingTo]    = useState(null);
  const [newItem,     setNewItem]     = useState(EMPTY_ITEM);
  const [deleteConf,  setDeleteConf]  = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [mobileMenu,  setMobileMenu]  = useState(false);
  const editFileRef = useRef();
  const addFileRef  = useRef();

  const toast_ = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setMenuLoading(true);
    const unsub = onSnapshot(MENU_DOC, snap => {
      if (snap.exists()) setMenu(snap.data());
      else setDoc(MENU_DOC, DEFAULT_MENU).then(() => setMenu(DEFAULT_MENU));
      setMenuLoading(false);
    }, () => { setMenu(DEFAULT_MENU); setMenuLoading(false); });
    return unsub;
  }, [user]);

  const persist = async (m) => {
    setSaving(true); setMenu(m);
    try { await setDoc(MENU_DOC, m); toast_("Saved & live on website ✓"); }
    catch (e) { toast_("Save failed: " + e.message, "err"); }
    setSaving(false);
  };

  const uploadImage = (file, onDone) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "oduns-menu");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD + "/image/upload");
    setUploading(true); setUploadPct(0);
    xhr.upload.onprogress = e => { if(e.lengthComputable) setUploadPct(Math.round(e.loaded/e.total*100)); };
    xhr.onload = () => {
      if (xhr.status === 200) { const r = JSON.parse(xhr.responseText); onDone(r.secure_url); toast_("Photo uploaded!"); }
      else toast_("Upload failed — check Cloudinary preset", "err");
      setUploading(false); setUploadPct(0);
    };
    xhr.onerror = () => { toast_("Upload failed", "err"); setUploading(false); };
    xhr.send(fd);
  };

  const handleLogin = async () => {
    setAuthErr(""); setAuthLoading(true);
    try { await signInWithEmailAndPassword(auth, email, pass); }
    catch (e) { setAuthErr(e.code==="auth/invalid-credential"||e.code==="auth/wrong-password" ? "Incorrect email or password." : e.code==="auth/user-not-found" ? "No account found with this email." : e.message); }
    setAuthLoading(false);
  };

  const toggleAvailable = (cat,id) => persist({...menu,[cat]:{...menu[cat],items:menu[cat].items.map(i=>i.id===id?{...i,available:!i.available}:i)}});
  const deleteItem = (cat,id) => { persist({...menu,[cat]:{...menu[cat],items:menu[cat].items.filter(i=>i.id!==id)}}); setDeleteConf(null); };

  const saveEdit = () => {
    if (!editItem.name.trim()||!editItem.amount) { toast_("Name & price required","err"); return; }
    const {cat,...item} = editItem;
    persist({...menu,[cat]:{...menu[cat],items:menu[cat].items.map(i=>i.id===item.id?item:i)}});
    setEditItem(null);
  };

  const addItem = () => {
    if (!newItem.name.trim()||!newItem.amount) { toast_("Name & price required","err"); return; }
    const allIds = Object.values(menu).flatMap(c=>c.items.map(i=>i.id));
    const id = Math.max(...allIds,500)+1;
    persist({...menu,[addingTo]:{...menu[addingTo],items:[...menu[addingTo].items,{...newItem,id,amount:Number(newItem.amount)}]}});
    setAddingTo(null); setNewItem(EMPTY_ITEM);
  };

  const visible = cat => (menu?.[cat]?.items||[]).filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter==="all"||(filter==="available"?i.available:!i.available))
  );

  const totalItems   = menu ? Object.values(menu).reduce((s,c)=>s+c.items.length,0) : 0;
  const unavailCount = menu ? Object.values(menu).reduce((s,c)=>s+c.items.filter(i=>!i.available).length,0) : 0;

  // Photo field used in both modals
  const PhotoField = ({item, setItem, fileRef}) => (
    <div style={S.field}>
      <label style={S.lbl}>Food Photo</label>
      <div style={S.photoRow}>
        {item.img
          ? <img src={item.img} alt="preview" style={S.photoPreview}/>
          : <div style={S.photoEmpty}>📷<br/>No photo</div>
        }
        <div style={S.photoActions}>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
            onChange={e => { const f=e.target.files[0]; if(f) uploadImage(f, url=>setItem(p=>({...p,img:url}))); e.target.value=""; }}
          />
          <button style={S.uploadBtn} disabled={uploading} onClick={()=>fileRef.current.click()}>
            {uploading ? uploadPct+"% uploading..." : item.img ? "📷 Change Photo" : "📷 Upload Photo"}
          </button>
          {item.img && <button style={S.removePhotoBtn} onClick={()=>setItem(p=>({...p,img:""}))}>✕ Remove</button>}
        </div>
      </div>
      {uploading && <div style={S.progressBar}><div style={{...S.progressFill,width:uploadPct+"%"}}/></div>}
    </div>
  );

  // ══ LOADING ══
  if (user===undefined) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}><div className="spinner"/><p style={{color:"#666",fontSize:"13px",marginTop:"14px"}}>Loading...</p></div>
    </div>
  );

  // ══ LOGIN SCREEN ══
  if (!user) return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.authWrap}>
        <div style={S.card}>
          <div style={S.logoRow}>
            <div style={S.logoMark}>O</div>
            <div><div style={S.logoName}>ODUN'S PLACE</div><div style={S.logoSub}>Admin Panel</div></div>
          </div>
          <h2 style={{fontSize:"20px",fontWeight:700,color:"#f0f0f0",marginBottom:"24px"}}>Sign In</h2>
          <div style={S.field}>
            <label style={S.lbl}>Email Address</label>
            <input style={S.inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
          <div style={S.field}>
            <label style={S.lbl}>Password</label>
            <input style={S.inp} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
          {authErr && <div style={S.errBox}>{authErr}</div>}
          <button style={{...S.authBtn,...(authLoading?{opacity:.7}:{})}} disabled={authLoading} onClick={handleLogin}>
            {authLoading ? "Signing in..." : "Sign In →"}
          </button>
          <p style={S.hint}>To change your password, go to Firebase Console → Authentication → Users</p>
        </div>
      </div>
    </div>
  );

  // ══ DASHBOARD ══
  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {toast && <div style={{...S.toast,...(toast.type==="err"?S.toastErr:S.toastOk)}}>{toast.msg}</div>}
      {saving && <div style={S.savingBar}>💾 Saving to Firebase...</div>}

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.hLeft}>
          <div style={S.logoMark}>O</div>
          <div>
            <div style={S.logoName}>Odun's Place</div>
            <div style={S.logoSub}>Menu Admin</div>
          </div>
        </div>
        {/* Desktop nav */}
        <div style={S.hRight}>
          <span style={S.hUser}>👤 {user.email}</span>
          <button style={S.logoutBtn} onClick={()=>signOut(auth)}>Sign Out</button>
        </div>
        {/* Mobile hamburger */}
        <button style={S.burger} onClick={()=>setMobileMenu(!mobileMenu)}>
          {mobileMenu ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenu && (
        <div style={S.mobileNav}>
          <span style={{fontSize:"12px",color:"rgba(240,240,240,0.4)",padding:"12px 16px",display:"block"}}>{user.email}</span>
          <button style={S.mobileNavBtn} onClick={()=>{signOut(auth);setMobileMenu(false);}}>Sign Out</button>
        </div>
      )}

      {menuLoading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 20px"}}>
          <div className="spinner"/><span style={{color:"#666",marginLeft:"14px",fontSize:"13px"}}>Loading menu...</span>
        </div>
      ) : (<>

        {/* ── STATS ── */}
        <div style={S.statsRow}>
          {[
            {label:"Total Items",  val:totalItems,             color:"#E8520A"},
            {label:"Available",    val:totalItems-unavailCount,color:"#0ba34f"},
            {label:"Unavailable",  val:unavailCount,           color:"#e53e3e"},
            {label:"Categories",   val:4,                      color:"#805ad5"},
          ].map(s=>(
            <div key={s.label} style={S.statCard}>
              <div style={{fontSize:"28px",fontWeight:700,color:s.color,lineHeight:1,marginBottom:"5px"}}>{s.val}</div>
              <div style={{fontSize:"10px",color:"rgba(240,240,240,0.35)",letterSpacing:"1px",textTransform:"uppercase"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div style={S.toolbar}>
          <input style={S.searchInp} placeholder="🔍 Search items..." value={search} onChange={e=>setSearch(e.target.value)} />
          <div style={S.filterRow}>
            {["all","available","unavailable"].map(f=>(
              <button key={f} style={{...S.filterBtn,...(filter===f?S.filterBtnOn:{})}} onClick={()=>setFilter(f)}>
                {f[0].toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <button style={S.resetBtn} onClick={()=>persist(DEFAULT_MENU)} title="Reset to default">↺</button>
        </div>

        {/* ── CAT TABS ── */}
        <div style={S.catScroll}>
          <div style={S.catTabs}>
            {Object.entries(menu).map(([k,cat])=>(
              <button key={k} style={{...S.catTab,...(activeTab===k?S.catTabOn:{})}} onClick={()=>setActiveTab(k)}>
                {cat.emoji} {cat.label} <span style={S.catBadge}>{cat.items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CARDS (mobile) / TABLE (desktop) ── */}
        <div style={S.tableWrap}>

          {/* Mobile card view */}
          <div className="mobile-cards">
            {visible(activeTab).length===0
              ? <p style={{padding:"32px",textAlign:"center",color:"rgba(240,240,240,0.25)"}}>No items found</p>
              : visible(activeTab).map(item=>(
                <div key={item.id} style={{...S.mobileCard,...(!item.available?{opacity:0.55}:{})}}>
                  <div style={S.mobileCardTop}>
                    {item.img
                      ? <img src={item.img} alt={item.name} style={S.mobileThumb}/>
                      : <div style={S.mobileThumbEmpty}>📷</div>
                    }
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:"15px",color:"#f0f0f0",marginBottom:"4px"}}>{item.name}</div>
                      <div style={{fontSize:"16px",fontWeight:700,color:"#E8520A",fontFamily:"Georgia,serif"}}>{fmt(item.amount)}</div>
                      <div style={{marginTop:"4px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
                        <span style={S.tagPill}>{item.tag||"—"}</span>
                        {!item.available && <span style={S.unavailPill}>Unavailable</span>}
                      </div>
                    </div>
                  </div>
                  {item.desc && <p style={{fontSize:"12px",color:"rgba(240,240,240,0.45)",marginTop:"8px",lineHeight:1.5}}>{item.desc}</p>}
                  <div style={S.mobileCardActions}>
                    <button style={{...S.toggleBtn,...(item.available?S.togOn:S.togOff)}} onClick={()=>toggleAvailable(activeTab,item.id)}>
                      {item.available?"✓ Available":"✗ Unavailable"}
                    </button>
                    <button style={S.editBtn} onClick={()=>setEditItem({...item,cat:activeTab})}>✏️ Edit</button>
                    <button style={S.delBtn} onClick={()=>setDeleteConf({id:item.id,cat:activeTab,name:item.name})}>🗑️</button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Desktop table view */}
          <table style={S.table} className="desktop-table">
            <thead>
              <tr>{["Photo","Name & Description","Tag","Price","Status","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {visible(activeTab).length===0
                ? <tr><td colSpan={6} style={{padding:"32px",textAlign:"center",color:"rgba(240,240,240,0.25)"}}>No items found</td></tr>
                : visible(activeTab).map(item=>(
                  <tr key={item.id} style={!item.available?{opacity:0.5}:{}}>
                    <td style={S.td}>
                      {item.img ? <img src={item.img} alt={item.name} style={S.thumb}/> : <div style={S.thumbEmpty}>📷</div>}
                    </td>
                    <td style={{...S.td,maxWidth:"220px"}}>
                      <div style={{fontWeight:600,color:"#f0f0f0",marginBottom:"3px"}}>{item.name}</div>
                      {item.desc && <div style={{fontSize:"11px",color:"rgba(240,240,240,0.4)",lineHeight:1.5}}>{item.desc}</div>}
                      {!item.available && <span style={S.unavailPill}>Unavailable</span>}
                    </td>
                    <td style={S.td}><span style={S.tagPill}>{item.tag||"—"}</span></td>
                    <td style={{...S.td,color:"#E8520A",fontWeight:700,fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>{fmt(item.amount)}</td>
                    <td style={S.td}>
                      <button style={{...S.toggleBtn,...(item.available?S.togOn:S.togOff)}} onClick={()=>toggleAvailable(activeTab,item.id)}>
                        {item.available?"✓ Available":"✗ Unavailable"}
                      </button>
                    </td>
                    <td style={S.td}>
                      <div style={{display:"flex",gap:"8px"}}>
                        <button style={S.editBtn} onClick={()=>setEditItem({...item,cat:activeTab})}>✏️ Edit</button>
                        <button style={S.delBtn} onClick={()=>setDeleteConf({id:item.id,cat:activeTab,name:item.name})}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          <button style={S.addBtn} onClick={()=>{setAddingTo(activeTab);setNewItem(EMPTY_ITEM);}}>
            + Add Item to {menu[activeTab]?.label}
          </button>
        </div>
      </>)}

      {/* ── EDIT MODAL ── */}
      {editItem && (
        <div style={S.backdrop} onClick={e=>e.target===e.currentTarget&&setEditItem(null)}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>✏️ Edit Item</h3>
            <PhotoField item={editItem} setItem={setEditItem} fileRef={editFileRef}/>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.lbl}>Item Name *</label>
                <input style={S.inp} value={editItem.name} onChange={e=>setEditItem({...editItem,name:e.target.value})}/>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>Price (₦) *</label>
                <input style={S.inp} type="number" value={editItem.amount} onChange={e=>setEditItem({...editItem,amount:Number(e.target.value)})}/>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.lbl}>Tag Label</label>
              <input style={S.inp} placeholder="Bestseller, Spicy, New..." value={editItem.tag} onChange={e=>setEditItem({...editItem,tag:e.target.value})}/>
            </div>
            <div style={S.field}>
              <label style={S.lbl}>Description</label>
              <textarea style={{...S.inp,height:"80px",resize:"vertical"}} placeholder="Describe this dish..." value={editItem.desc||""} onChange={e=>setEditItem({...editItem,desc:e.target.value})}/>
            </div>
            <div style={S.field}>
              <label style={S.lbl}>Availability</label>
              <div style={{display:"flex",gap:"20px",marginTop:"4px"}}>
                <label style={S.radioLbl}><input type="radio" checked={editItem.available} onChange={()=>setEditItem({...editItem,available:true})}/> Available</label>
                <label style={S.radioLbl}><input type="radio" checked={!editItem.available} onChange={()=>setEditItem({...editItem,available:false})}/> Unavailable</label>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button style={S.cancelBtn} onClick={()=>setEditItem(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {addingTo && (
        <div style={S.backdrop} onClick={e=>e.target===e.currentTarget&&setAddingTo(null)}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>+ Add to {menu[addingTo]?.label}</h3>
            <PhotoField item={newItem} setItem={setNewItem} fileRef={addFileRef}/>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.lbl}>Item Name *</label>
                <input style={S.inp} placeholder="e.g. Jollof Spaghetti" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>Price (₦) *</label>
                <input style={S.inp} type="number" placeholder="8000" value={newItem.amount} onChange={e=>setNewItem({...newItem,amount:e.target.value})}/>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.lbl}>Tag Label</label>
              <input style={S.inp} placeholder="New, Spicy, Popular..." value={newItem.tag} onChange={e=>setNewItem({...newItem,tag:e.target.value})}/>
            </div>
            <div style={S.field}>
              <label style={S.lbl}>Description</label>
              <textarea style={{...S.inp,height:"80px",resize:"vertical"}} placeholder="Describe this dish..." value={newItem.desc||""} onChange={e=>setNewItem({...newItem,desc:e.target.value})}/>
            </div>
            <div style={S.field}>
              <label style={S.lbl}>Availability</label>
              <div style={{display:"flex",gap:"20px",marginTop:"4px"}}>
                <label style={S.radioLbl}><input type="radio" checked={newItem.available} onChange={()=>setNewItem({...newItem,available:true})}/> Available now</label>
                <label style={S.radioLbl}><input type="radio" checked={!newItem.available} onChange={()=>setNewItem({...newItem,available:false})}/> Coming soon</label>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button style={S.cancelBtn} onClick={()=>setAddingTo(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={addItem}>Add to Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConf && (
        <div style={S.backdrop} onClick={e=>e.target===e.currentTarget&&setDeleteConf(null)}>
          <div style={{...S.modal,maxWidth:"400px"}}>
            <h3 style={{...S.modalTitle,color:"#e53e3e"}}>Remove Item?</h3>
            <p style={{fontSize:"14px",color:"rgba(240,240,240,0.6)",lineHeight:1.7}}>
              Remove <strong>"{deleteConf.name}"</strong>? This cannot be undone.
            </p>
            <div style={S.modalFoot}>
              <button style={S.cancelBtn} onClick={()=>setDeleteConf(null)}>Keep It</button>
              <button style={{...S.saveBtn,background:"#e53e3e"}} onClick={()=>deleteItem(deleteConf.cat,deleteConf.id)}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page:          {minHeight:"100vh",background:"#0f0f0f",fontFamily:"'Inter',system-ui,sans-serif",color:"#f0f0f0"},
  authWrap:      {display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"20px"},
  card:          {background:"#1a1a1a",border:"1px solid rgba(232,82,10,0.2)",padding:"36px",width:"100%",maxWidth:"420px",borderRadius:"8px"},
  logoRow:       {display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"},
  logoMark:      {fontFamily:"Georgia,serif",fontSize:"38px",fontWeight:700,color:"#E8520A",lineHeight:1},
  logoName:      {fontSize:"11px",fontWeight:700,letterSpacing:"4px",color:"#f0f0f0",textTransform:"uppercase"},
  logoSub:       {fontSize:"11px",color:"rgba(240,240,240,0.4)",marginTop:"2px"},
  field:         {display:"flex",flexDirection:"column",gap:"7px",marginBottom:"16px"},
  lbl:           {fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(240,240,240,0.4)"},
  inp:           {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",padding:"11px 13px",color:"#f0f0f0",fontSize:"14px",outline:"none",borderRadius:"6px",width:"100%",boxSizing:"border-box"},
  errBox:        {background:"rgba(229,62,62,0.1)",border:"1px solid rgba(229,62,62,0.3)",color:"#fc8181",padding:"10px 14px",fontSize:"13px",borderRadius:"6px",marginBottom:"16px"},
  authBtn:       {width:"100%",background:"#E8520A",border:"none",color:"#fff",padding:"13px",fontSize:"13px",fontWeight:700,cursor:"pointer",borderRadius:"6px"},
  hint:          {fontSize:"11px",color:"rgba(240,240,240,0.2)",marginTop:"16px",textAlign:"center",lineHeight:1.6},
  tabs:          {display:"flex",borderBottom:"1px solid rgba(255,255,255,0.1)",marginBottom:"28px"},
  tab:           {flex:1,background:"none",border:"none",borderBottom:"2px solid transparent",color:"rgba(240,240,240,0.4)",padding:"10px",fontSize:"13px",fontWeight:600,cursor:"pointer",marginBottom:"-1px"},
  tabOn:         {color:"#E8520A",borderBottomColor:"#E8520A"},
  header:        {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:"#1a1a1a",borderBottom:"1px solid rgba(232,82,10,0.15)",position:"sticky",top:0,zIndex:100},
  hLeft:         {display:"flex",alignItems:"center",gap:"10px"},
  hRight:        {display:"flex",alignItems:"center",gap:"12px"},
  hUser:         {fontSize:"12px",color:"rgba(240,240,240,0.4)"},
  logoutBtn:     {background:"none",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(240,240,240,0.5)",padding:"6px 14px",fontSize:"12px",cursor:"pointer",borderRadius:"6px"},
  burger:        {display:"none",background:"none",border:"none",color:"#f0f0f0",fontSize:"20px",cursor:"pointer",padding:"4px 8px"},
  mobileNav:     {background:"#1a1a1a",borderBottom:"1px solid rgba(255,255,255,0.08)"},
  mobileNavBtn:  {display:"block",width:"100%",textAlign:"left",background:"none",border:"none",color:"rgba(240,240,240,0.6)",padding:"14px 20px",fontSize:"14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.06)"},
  statsRow:      {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"rgba(255,255,255,0.04)",margin:"16px",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",overflow:"hidden"},
  statCard:      {background:"#1a1a1a",padding:"16px 18px"},
  toolbar:       {display:"flex",alignItems:"center",gap:"8px",padding:"0 16px 12px",flexWrap:"wrap"},
  searchInp:     {flex:1,minWidth:"160px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",padding:"9px 13px",color:"#f0f0f0",fontSize:"14px",outline:"none",borderRadius:"6px"},
  filterRow:     {display:"flex",gap:"5px"},
  filterBtn:     {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(240,240,240,0.45)",padding:"7px 12px",fontSize:"12px",cursor:"pointer",borderRadius:"6px"},
  filterBtnOn:   {background:"rgba(232,82,10,0.15)",borderColor:"rgba(232,82,10,0.4)",color:"#E8520A",fontWeight:600},
  resetBtn:      {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(240,240,240,0.35)",padding:"7px 12px",fontSize:"14px",cursor:"pointer",borderRadius:"6px"},
  catScroll:     {overflowX:"auto",padding:"0 16px"},
  catTabs:       {display:"flex",borderBottom:"1px solid rgba(255,255,255,0.08)",minWidth:"max-content"},
  catTab:        {background:"none",border:"none",borderBottom:"2px solid transparent",color:"rgba(240,240,240,0.4)",padding:"10px 18px",fontSize:"13px",fontWeight:500,cursor:"pointer",marginBottom:"-1px",whiteSpace:"nowrap"},
  catTabOn:      {color:"#E8520A",borderBottomColor:"#E8520A",fontWeight:700},
  catBadge:      {background:"rgba(255,255,255,0.08)",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",marginLeft:"6px"},
  tableWrap:     {margin:"16px",background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",overflow:"hidden"},
  table:         {width:"100%",borderCollapse:"collapse"},
  th:            {padding:"11px 14px",textAlign:"left",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(240,240,240,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:600},
  td:            {padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"13px",verticalAlign:"middle"},
  thumb:         {width:"52px",height:"44px",objectFit:"cover",borderRadius:"6px",display:"block"},
  thumbEmpty:    {width:"52px",height:"44px",background:"rgba(255,255,255,0.04)",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"},
  mobileCard:    {padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.06)"},
  mobileCardTop: {display:"flex",gap:"12px",marginBottom:"8px"},
  mobileThumb:   {width:"64px",height:"60px",objectFit:"cover",borderRadius:"6px",flexShrink:0},
  mobileThumbEmpty:{width:"64px",height:"60px",background:"rgba(255,255,255,0.04)",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0},
  mobileCardActions:{display:"flex",gap:"8px",marginTop:"10px",flexWrap:"wrap"},
  unavailPill:   {background:"rgba(229,62,62,0.12)",color:"#fc8181",fontSize:"10px",padding:"2px 8px",borderRadius:"10px",fontWeight:600},
  tagPill:       {background:"rgba(232,82,10,0.12)",color:"#E8520A",fontSize:"11px",padding:"3px 9px",borderRadius:"10px",fontWeight:600},
  toggleBtn:     {border:"none",padding:"5px 11px",fontSize:"11px",fontWeight:700,cursor:"pointer",borderRadius:"20px"},
  togOn:         {background:"rgba(11,163,79,0.14)",color:"#0ba34f",border:"1px solid rgba(11,163,79,0.3)"},
  togOff:        {background:"rgba(229,62,62,0.1)",color:"#fc8181",border:"1px solid rgba(229,62,62,0.25)"},
  editBtn:       {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(240,240,240,0.7)",padding:"6px 11px",fontSize:"12px",cursor:"pointer",borderRadius:"6px"},
  delBtn:        {background:"rgba(229,62,62,0.08)",border:"1px solid rgba(229,62,62,0.2)",color:"#fc8181",padding:"6px 10px",fontSize:"13px",cursor:"pointer",borderRadius:"6px"},
  addBtn:        {width:"100%",background:"rgba(232,82,10,0.07)",border:"none",borderTop:"1px dashed rgba(232,82,10,0.3)",color:"#E8520A",padding:"16px",fontSize:"13px",fontWeight:600,cursor:"pointer"},
  backdrop:      {position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",overflowY:"auto"},
  modal:         {background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",padding:"28px",width:"100%",maxWidth:"520px",borderRadius:"8px",marginTop:"20px"},
  modalTitle:    {fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:700,color:"#f0f0f0",marginBottom:"20px"},
  modalFoot:     {display:"flex",gap:"10px",marginTop:"24px"},
  twoCol:        {display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"},
  cancelBtn:     {flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(240,240,240,0.6)",padding:"11px",fontSize:"13px",cursor:"pointer",borderRadius:"6px"},
  saveBtn:       {flex:1,background:"#E8520A",border:"none",color:"#fff",padding:"11px",fontSize:"13px",fontWeight:700,cursor:"pointer",borderRadius:"6px"},
  radioLbl:      {fontSize:"14px",color:"rgba(240,240,240,0.65)",display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"},
  photoRow:      {display:"flex",alignItems:"center",gap:"14px"},
  photoPreview:  {width:"76px",height:"68px",objectFit:"cover",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.1)"},
  photoEmpty:    {width:"76px",height:"68px",background:"rgba(255,255,255,0.04)",borderRadius:"8px",border:"1px dashed rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexDirection:"column",gap:"2px"},
  photoActions:  {display:"flex",flexDirection:"column",gap:"8px"},
  uploadBtn:     {background:"rgba(232,82,10,0.12)",border:"1px solid rgba(232,82,10,0.3)",color:"#E8520A",padding:"8px 14px",fontSize:"12px",fontWeight:600,cursor:"pointer",borderRadius:"6px"},
  removePhotoBtn:{background:"rgba(229,62,62,0.08)",border:"1px solid rgba(229,62,62,0.2)",color:"#fc8181",padding:"6px 14px",fontSize:"11px",cursor:"pointer",borderRadius:"6px"},
  progressBar:   {height:"4px",background:"rgba(255,255,255,0.08)",borderRadius:"2px",overflow:"hidden",marginTop:"8px"},
  progressFill:  {height:"100%",background:"#E8520A",borderRadius:"2px",transition:"width .2s"},
  toast:         {position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",padding:"11px 22px",borderRadius:"6px",fontSize:"13px",fontWeight:600,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"},
  toastOk:       {background:"#0ba34f",color:"#fff"},
  toastErr:      {background:"#e53e3e",color:"#fff"},
  savingBar:     {position:"fixed",top:0,left:0,right:0,background:"rgba(232,82,10,0.95)",color:"#fff",fontSize:"12px",fontWeight:600,textAlign:"center",padding:"6px",zIndex:9998},
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; background:#0f0f0f; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spinner { width:30px;height:30px;border:3px solid rgba(232,82,10,0.2);border-top-color:#E8520A;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto; }
  input:focus,select:focus,textarea:focus { border-color:rgba(232,82,10,0.5)!important;outline:none; }
  button:hover:not(:disabled) { filter:brightness(1.1); }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
  input[type=file] { display:none!important; }
  textarea { font-family:'Inter',system-ui,sans-serif; }
  .mobile-cards { display:none; }
  .desktop-table { display:table; }
  @media (max-width:768px) {
    .mobile-cards { display:block!important; }
    .desktop-table { display:none!important; }
    div[style*="grid-template-columns: repeat(4"] { grid-template-columns:1fr 1fr!important; }
    div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns:1fr!important; }
    div[style*="display:flex"][style*="gap:12px"] { flex-direction:column; }
  }
  @media (max-width:640px) {
    div[style*="logoMark"] { font-size:28px!important; }
    button[style*="burger"] { display:block!important; }
    div[style*="hRight"] { display:none!important; }
  }
`;