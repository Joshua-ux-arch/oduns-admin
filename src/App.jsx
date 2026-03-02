import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// ── Firebase config ──
const firebaseConfig = {
  apiKey: "AIzaSyDPok0kq7klqcJG1z6A0oE9RZkpLdPTTto",
  authDomain: "oduns-7f07a.firebaseapp.com",
  projectId: "oduns-7f07a",
  storageBucket: "oduns-7f07a.firebasestorage.app",
  messagingSenderId: "159165548435",
  appId: "1:159165548435:web:638cfeb13c965f08118a66"
};

const app      = initializeApp(firebaseConfig);
const db       = getFirestore(app);
// Cloudinary config
const CLOUDINARY_CLOUD   = "dhjknh0to";
const CLOUDINARY_PRESET  = "f3gynupo";
const auth     = getAuth(app);

const MENU_DOC = doc(db, "restaurant", "menu");
const fmt      = n => "₦" + Number(n).toLocaleString("en-NG");

const DEFAULT_MENU = {
  food: {
    label:"Food", emoji:"🍽️",
    items:[
      {id:101,name:"Party Jollof Rice",      amount:12500,tag:"Bestseller",  available:true,img:""},
      {id:102,name:"Fried Rice & Chicken",   amount:11000,tag:"Classic",     available:true,img:""},
      {id:103,name:"White Rice & Stew",      amount:8500, tag:"Comfort",     available:true,img:""},
      {id:104,name:"Ofada Rice & Ayamase",   amount:13500,tag:"Local Fav",   available:true,img:""},
      {id:105,name:"Beans & Plantain",       amount:6500, tag:"Vegan",       available:true,img:""},
      {id:106,name:"Moi Moi (3 wraps)",      amount:5000, tag:"Steamed",     available:true,img:""},
      {id:107,name:"Beef Suya Platter",      amount:15000,tag:"Must Try",    available:true,img:""},
      {id:108,name:"Pepper Soup (Goat)",     amount:14000,tag:"Spicy",       available:true,img:""},
      {id:109,name:"Pepper Soup (Catfish)",  amount:16000,tag:"Spicy",       available:true,img:""},
      {id:110,name:"Asun (Spicy Goat)",      amount:13000,tag:"Smoky",       available:true,img:""},
    ]
  },
  swallow: {
    label:"Swallow & Soups", emoji:"🫙",
    items:[
      {id:201,name:"Pounded Yam & Egusi",      amount:18000,tag:"Signature",    available:true,img:""},
      {id:202,name:"Pounded Yam & Ogbono",     amount:18000,tag:"Draw Soup",    available:true,img:""},
      {id:203,name:"Pounded Yam & Ofe Onugbu", amount:18500,tag:"Igbo Special", available:true,img:""},
      {id:204,name:"Pounded Yam & Oha Soup",   amount:19000,tag:"Seasonal",     available:true,img:""},
      {id:205,name:"Eba & Egusi Soup",          amount:15000,tag:"Classic",      available:true,img:""},
      {id:206,name:"Eba & Ogbono Soup",         amount:15000,tag:"Draw Soup",    available:true,img:""},
      {id:207,name:"Fufu & Egusi Soup",         amount:16000,tag:"Soft",         available:true,img:""},
      {id:208,name:"Fufu & Okra Soup",          amount:16000,tag:"Fresh",        available:true,img:""},
      {id:209,name:"Amala & Ewedu",             amount:14000,tag:"Yoruba Fav",   available:true,img:""},
      {id:210,name:"Amala & Abula",             amount:15500,tag:"Premium",      available:true,img:""},
      {id:211,name:"Semolina & Veg Soup",       amount:14500,tag:"Fresh",        available:true,img:""},
      {id:212,name:"Wheat & Oha Soup",          amount:16000,tag:"Healthy",      available:true,img:""},
    ]
  },
  snacks: {
    label:"Snacks", emoji:"🍟",
    items:[
      {id:301,name:"Puff Puff (10 pcs)",   amount:3500, tag:"Fried",      available:true,img:""},
      {id:302,name:"Chin Chin (Pack)",      amount:2500, tag:"Crunchy",    available:true,img:""},
      {id:303,name:"Spring Rolls (6 pcs)", amount:5000, tag:"Crispy",     available:true,img:""},
      {id:304,name:"Samosa (6 pcs)",        amount:5000, tag:"Crispy",     available:true,img:""},
      {id:305,name:"Scotch Eggs (2 pcs)",   amount:4500, tag:"Classic",    available:true,img:""},
      {id:306,name:"Gizdodo",               amount:6500, tag:"Fan Fav",    available:true,img:""},
      {id:307,name:"Peppered Gizzard",      amount:7000, tag:"Spicy",      available:true,img:""},
      {id:308,name:"Small Chops Platter",   amount:12000,tag:"Party Pack", available:true,img:""},
      {id:309,name:"Meatpie (2 pcs)",       amount:3000, tag:"Baked",      available:true,img:""},
      {id:310,name:"Fish Roll (2 pcs)",     amount:3000, tag:"Classic",    available:true,img:""},
    ]
  },
  drinks: {
    label:"Drinks", emoji:"🥤",
    items:[
      {id:401,name:"Zobo (Chilled)",       amount:2000,tag:"Signature",   available:true,img:""},
      {id:402,name:"Kunu (Spiced)",        amount:2000,tag:"Traditional", available:true,img:""},
      {id:403,name:"Chapman",              amount:3500,tag:"Classic",     available:true,img:""},
      {id:404,name:"Watermelon Juice",     amount:3000,tag:"Fresh",       available:true,img:""},
      {id:405,name:"Pineapple Juice",      amount:3000,tag:"Fresh",       available:true,img:""},
      {id:406,name:"Yoghurt Smoothie",     amount:3500,tag:"Healthy",     available:true,img:""},
      {id:407,name:"Soft Drink (Bottle)",  amount:700, tag:"Cold",        available:true,img:""},
      {id:408,name:"Malta Guinness",       amount:800, tag:"Cold",        available:true,img:""},
      {id:409,name:"Water (500ml)",        amount:300, tag:"Still",       available:true,img:""},
      {id:410,name:"Water (1.5L)",         amount:600, tag:"Still",       available:true,img:""},
    ]
  },
};

export default function App() {
  const [user,       setUser]       = useState(undefined); // undefined=loading, null=logged out
  const [authMode,   setAuthMode]   = useState("login");
  const [email,      setEmail]      = useState("");
  const [pass,       setPass]       = useState("");
  const [authErr,    setAuthErr]    = useState("");
  const [authLoading,setAuthLoading]= useState(false);

  const [menu,       setMenu]       = useState(null);
  const [menuLoading,setMenuLoading]= useState(true);
  const [saving,     setSaving]     = useState(false);
  const [activeTab,  setActiveTab]  = useState("food");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [toast,      setToast]      = useState(null);

  const [editItem,   setEditItem]   = useState(null);
  const [addingTo,   setAddingTo]   = useState(null);
  const [newItem,    setNewItem]    = useState({name:"",amount:"",tag:"",available:true,img:""});
  const [deleteConf, setDeleteConf] = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const editFileRef = useRef();
  const addFileRef  = useRef();

  const toast_ = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  // ── Live menu listener from Firestore ──
  useEffect(() => {
    if (!user) return;
    setMenuLoading(true);
    const unsub = onSnapshot(MENU_DOC, snap => {
      if (snap.exists()) {
        setMenu(snap.data());
      } else {
        // First time — seed with default menu
        setDoc(MENU_DOC, DEFAULT_MENU).then(() => setMenu(DEFAULT_MENU));
      }
      setMenuLoading(false);
    }, () => { setMenu(DEFAULT_MENU); setMenuLoading(false); });
    return unsub;
  }, [user]);

  // ── Save menu to Firestore ──
  const persist = async (m) => {
    setSaving(true);
    setMenu(m);
    try {
      await setDoc(MENU_DOC, m);
      toast_("Saved & live on website ✓");
    } catch (e) {
      toast_("Save failed: " + e.message, "err");
    }
    setSaving(false);
  };

  // ── Upload image to Cloudinary ──
  const uploadImage = async (file, onDone) => {
    if (!file) return;
    setUploading(true);
    setUploadPct(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);
      formData.append("folder", "oduns-menu");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD + "/image/upload");

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) setUploadPct(Math.round(e.loaded / e.total * 100));
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          onDone(res.secure_url);
          toast_("Photo uploaded!");
        } else {
          toast_("Upload failed. Check your Cloudinary preset.", "err");
        }
        setUploading(false);
        setUploadPct(0);
      };

      xhr.onerror = () => {
        toast_("Upload failed — check internet connection.", "err");
        setUploading(false);
        setUploadPct(0);
      };

      xhr.send(formData);
    } catch (err) {
      toast_("Upload error: " + err.message, "err");
      setUploading(false);
    }
  };

  // ── Auth actions ──
  const handleLogin = async () => {
    setAuthErr(""); setAuthLoading(true);
    try { await signInWithEmailAndPassword(auth, email, pass); }
    catch (e) { setAuthErr(e.code === "auth/invalid-credential" ? "Incorrect email or password." : e.message); }
    setAuthLoading(false);
  };

  const handleSignup = async () => {
    setAuthErr(""); setAuthLoading(true);
    try { await createUserWithEmailAndPassword(auth, email, pass); }
    catch (e) { setAuthErr(e.code === "auth/email-already-in-use" ? "Email already registered." : e.code === "auth/weak-password" ? "Password must be at least 6 characters." : e.message); }
    setAuthLoading(false);
  };

  const handleLogout = () => signOut(auth);

  // ── Menu actions ──
  const toggleAvailable = (cat, id) => {
    const m = {...menu, [cat]:{...menu[cat], items:menu[cat].items.map(i=>i.id===id?{...i,available:!i.available}:i)}};
    persist(m);
  };

  const deleteItem = (cat, id) => {
    const m = {...menu, [cat]:{...menu[cat], items:menu[cat].items.filter(i=>i.id!==id)}};
    persist(m); setDeleteConf(null);
  };

  const saveEdit = () => {
    if (!editItem.name.trim() || !editItem.amount) { toast_("Name & price required","err"); return; }
    const {cat, ...item} = editItem;
    const m = {...menu, [cat]:{...menu[cat], items:menu[cat].items.map(i=>i.id===item.id?item:i)}};
    persist(m); setEditItem(null);
  };

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.amount) { toast_("Name & price required","err"); return; }
    const allIds = Object.values(menu).flatMap(c=>c.items.map(i=>i.id));
    const id = Math.max(...allIds, 500) + 1;
    const item = {...newItem, id, amount:Number(newItem.amount)};
    const m = {...menu, [addingTo]:{...menu[addingTo], items:[...menu[addingTo].items, item]}};
    persist(m); setAddingTo(null); setNewItem({name:"",amount:"",tag:"",available:true,img:""});
  };

  const resetMenu = () => persist(DEFAULT_MENU);

  const visible = (cat) => (menu?.[cat]?.items || []).filter(item => {
    const s = item.name.toLowerCase().includes(search.toLowerCase());
    const f = filter==="all" || (filter==="available" ? item.available : !item.available);
    return s && f;
  });

  const totalItems   = menu ? Object.values(menu).reduce((s,c)=>s+c.items.length,0) : 0;
  const unavailCount = menu ? Object.values(menu).reduce((s,c)=>s+c.items.filter(i=>!i.available).length,0) : 0;

  // ══ LOADING SCREEN ══
  if (user === undefined) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={S.spinner}/>
        <p style={{color:"rgba(240,240,240,0.4)",fontSize:"13px",marginTop:"16px"}}>Loading...</p>
      </div>
    </div>
  );

  // ══ AUTH SCREEN ══
  if (!user) return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.authWrap}>
        <div style={S.card}>
          <div style={S.logoRow}>
            <div style={S.logoMark}>O</div>
            <div><div style={S.logoName}>ODUN'S PLACE</div><div style={S.logoSub}>Admin Panel</div></div>
          </div>
          <div style={S.tabs}>
            {["login","signup"].map(m=>(
              <button key={m} style={{...S.tab,...(authMode===m?S.tabOn:{})}} onClick={()=>{setAuthMode(m);setAuthErr("");}}>
                {m==="login"?"Sign In":"Sign Up"}
              </button>
            ))}
          </div>
          <div style={S.field}><label style={S.lbl}>Email Address</label>
            <input style={S.inp} type="email" placeholder="admin@odunsplace.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(authMode==="login"?handleLogin():handleSignup())} />
          </div>
          <div style={S.field}><label style={S.lbl}>Password</label>
            <input style={S.inp} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(authMode==="login"?handleLogin():handleSignup())} />
          </div>
          {authErr && <div style={S.errBox}>{authErr}</div>}
          <button style={{...S.authBtn,...(authLoading?{opacity:.7}:{})}} disabled={authLoading} onClick={authMode==="login"?handleLogin:handleSignup}>
            {authLoading ? "Please wait..." : authMode==="login" ? "Sign In →" : "Create Account →"}
          </button>
          {authMode==="login" && <p style={S.hint}>First time? Switch to Sign Up to create your account.</p>}
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

      {/* HEADER */}
      <header style={S.header}>
        <div style={S.hLeft}>
          <div style={S.logoMark}>O</div>
          <div><div style={S.logoName}>Odun's Place</div><div style={S.logoSub}>Menu Admin · {user.email}</div></div>
        </div>
        <button style={S.logoutBtn} onClick={handleLogout}>Sign Out</button>
      </header>

      {menuLoading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px"}}>
          <div style={S.spinner}/><span style={{color:"rgba(240,240,240,0.4)",marginLeft:"14px",fontSize:"13px"}}>Loading menu from Firebase...</span>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div style={S.statsRow}>
            {[
              {label:"Total Items",  val:totalItems,             color:"#E8520A"},
              {label:"Available",    val:totalItems-unavailCount,color:"#0ba34f"},
              {label:"Unavailable",  val:unavailCount,           color:"#e53e3e"},
              {label:"Categories",   val:4,                      color:"#805ad5"},
            ].map(s=>(
              <div key={s.label} style={S.statCard}>
                <div style={{...S.statNum,color:s.color}}>{s.val}</div>
                <div style={S.statLbl}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TOOLBAR */}
          <div style={S.toolbar}>
            <input style={S.searchInp} placeholder="🔍  Search items..." value={search} onChange={e=>setSearch(e.target.value)} />
            <div style={S.filterRow}>
              {["all","available","unavailable"].map(f=>(
                <button key={f} style={{...S.filterBtn,...(filter===f?S.filterBtnOn:{})}} onClick={()=>setFilter(f)}>
                  {f[0].toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <button style={S.resetBtn} onClick={resetMenu}>↺ Reset</button>
          </div>

          {/* CAT TABS */}
          <div style={S.catTabs}>
            {Object.entries(menu).map(([k,cat])=>(
              <button key={k} style={{...S.catTab,...(activeTab===k?S.catTabOn:{})}} onClick={()=>setActiveTab(k)}>
                {cat.emoji} {cat.label} <span style={S.catBadge}>{cat.items.length}</span>
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>{["Photo","Item Name","Tag","Price","Status","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {visible(activeTab).length===0
                  ? <tr><td colSpan={6} style={S.empty}>No items found</td></tr>
                  : visible(activeTab).map(item=>(
                    <tr key={item.id} style={{...S.tr,...(!item.available?{opacity:0.5}:{})}}>
                      <td style={S.td}>
                        {item.img
                          ? <img src={item.img} alt={item.name} style={S.thumb} />
                          : <div style={S.thumbEmpty}>No photo</div>
                        }
                      </td>
                      <td style={S.td}>
                        <span style={{fontWeight:500}}>{item.name}</span>
                        {!item.available && <span style={S.unavailPill}>Unavailable</span>}
                      </td>
                      <td style={S.td}><span style={S.tagPill}>{item.tag||"—"}</span></td>
                      <td style={{...S.td,color:"#E8520A",fontWeight:700,fontFamily:"Georgia,serif"}}>{fmt(item.amount)}</td>
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
            <button style={S.addBtn} onClick={()=>{setAddingTo(activeTab);setNewItem({name:"",amount:"",tag:"",available:true,img:""});}}>
              + Add Item to {menu[activeTab]?.label}
            </button>
          </div>
        </>
      )}

      {/* ── EDIT MODAL ── */}
      {editItem && (
        <div style={S.backdrop} onClick={e=>e.target===e.currentTarget&&setEditItem(null)}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>Edit: {editItem.name}</h3>

            {/* Photo upload */}
            <div style={S.field}>
              <label style={S.lbl}>Food Photo</label>
              <div style={S.photoRow}>
                {editItem.img
                  ? <img src={editItem.img} alt="preview" style={S.photoPreview} />
                  : <div style={S.photoEmpty}>No photo yet</div>
                }
                <div style={S.photoActions}>
                  <input ref={editFileRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      uploadImage(file, url => setEditItem(prev => ({...prev, img:url})));
                    }}
                  />
                  <button style={S.uploadBtn} disabled={uploading} onClick={()=>editFileRef.current.click()}>
                    {uploading ? uploadPct+"% uploading..." : editItem.img ? "Change Photo" : "Upload Photo"}
                  </button>
                  {editItem.img && <button style={S.removePhotoBtn} onClick={()=>setEditItem(p=>({...p,img:""}))}>Remove</button>}
                </div>
              </div>
              {uploading && <div style={S.progressBar}><div style={{...S.progressFill,width:uploadPct+"%"}}/></div>}
            </div>

            <div style={S.field}><label style={S.lbl}>Item Name *</label><input style={S.inp} value={editItem.name} onChange={e=>setEditItem({...editItem,name:e.target.value})} /></div>
            <div style={S.field}><label style={S.lbl}>Price (₦) *</label><input style={S.inp} type="number" value={editItem.amount} onChange={e=>setEditItem({...editItem,amount:Number(e.target.value)})} /></div>
            <div style={S.field}><label style={S.lbl}>Tag</label><input style={S.inp} placeholder="Bestseller, Spicy, New..." value={editItem.tag} onChange={e=>setEditItem({...editItem,tag:e.target.value})} /></div>
            <div style={S.field}><label style={S.lbl}>Availability</label>
              <div style={{display:"flex",gap:"20px",marginTop:"4px"}}>
                <label style={S.radioLbl}><input type="radio" checked={editItem.available} onChange={()=>setEditItem({...editItem,available:true})} /> Available</label>
                <label style={S.radioLbl}><input type="radio" checked={!editItem.available} onChange={()=>setEditItem({...editItem,available:false})} /> Unavailable</label>
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
            <h3 style={S.modalTitle}>Add to {menu[addingTo]?.label}</h3>

            {/* Photo upload */}
            <div style={S.field}>
              <label style={S.lbl}>Food Photo</label>
              <div style={S.photoRow}>
                {newItem.img
                  ? <img src={newItem.img} alt="preview" style={S.photoPreview} />
                  : <div style={S.photoEmpty}>No photo yet</div>
                }
                <div style={S.photoActions}>
                  <input ref={addFileRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      uploadImage(file, url => setNewItem(prev => ({...prev, img:url})));
                    }}
                  />
                  <button style={S.uploadBtn} disabled={uploading} onClick={()=>addFileRef.current.click()}>
                    {uploading ? uploadPct+"% uploading..." : newItem.img ? "Change Photo" : "Upload Photo"}
                  </button>
                  {newItem.img && <button style={S.removePhotoBtn} onClick={()=>setNewItem(p=>({...p,img:""}))}>Remove</button>}
                </div>
              </div>
              {uploading && <div style={S.progressBar}><div style={{...S.progressFill,width:uploadPct+"%"}}/></div>}
            </div>

            <div style={S.field}><label style={S.lbl}>Item Name *</label><input style={S.inp} placeholder="e.g. Jollof Spaghetti" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} /></div>
            <div style={S.field}><label style={S.lbl}>Price (₦) *</label><input style={S.inp} type="number" placeholder="8000" value={newItem.amount} onChange={e=>setNewItem({...newItem,amount:e.target.value})} /></div>
            <div style={S.field}><label style={S.lbl}>Tag</label><input style={S.inp} placeholder="e.g. New, Spicy, Popular" value={newItem.tag} onChange={e=>setNewItem({...newItem,tag:e.target.value})} /></div>
            <div style={S.field}><label style={S.lbl}>Availability</label>
              <div style={{display:"flex",gap:"20px",marginTop:"4px"}}>
                <label style={S.radioLbl}><input type="radio" checked={newItem.available} onChange={()=>setNewItem({...newItem,available:true})} /> Available now</label>
                <label style={S.radioLbl}><input type="radio" checked={!newItem.available} onChange={()=>setNewItem({...newItem,available:false})} /> Coming soon</label>
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
              <button style={{...S.saveBtn,background:"#e53e3e"}} onClick={()=>deleteItem(deleteConf.cat,deleteConf.id)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page:         {minHeight:"100vh",background:"#0f0f0f",fontFamily:"'Inter',system-ui,sans-serif",color:"#f0f0f0"},
  authWrap:     {display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"20px"},
  card:         {background:"#1a1a1a",border:"1px solid rgba(232,82,10,0.2)",padding:"40px",width:"100%",maxWidth:"420px",borderRadius:"6px"},
  logoRow:      {display:"flex",alignItems:"center",gap:"12px",marginBottom:"32px"},
  logoMark:     {fontFamily:"Georgia,serif",fontSize:"40px",fontWeight:700,color:"#E8520A",lineHeight:1},
  logoName:     {fontSize:"11px",fontWeight:700,letterSpacing:"4px",color:"#f0f0f0",textTransform:"uppercase"},
  logoSub:      {fontSize:"11px",color:"rgba(240,240,240,0.4)",marginTop:"2px"},
  tabs:         {display:"flex",borderBottom:"1px solid rgba(255,255,255,0.1)",marginBottom:"28px"},
  tab:          {flex:1,background:"none",border:"none",borderBottom:"2px solid transparent",color:"rgba(240,240,240,0.4)",padding:"10px",fontSize:"13px",fontWeight:600,cursor:"pointer",marginBottom:"-1px"},
  tabOn:        {color:"#E8520A",borderBottomColor:"#E8520A"},
  field:        {display:"flex",flexDirection:"column",gap:"7px",marginBottom:"18px"},
  lbl:          {fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(240,240,240,0.4)"},
  inp:          {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",padding:"12px 14px",color:"#f0f0f0",fontSize:"14px",outline:"none",borderRadius:"4px",width:"100%",boxSizing:"border-box"},
  errBox:       {background:"rgba(229,62,62,0.1)",border:"1px solid rgba(229,62,62,0.3)",color:"#fc8181",padding:"10px 14px",fontSize:"13px",borderRadius:"4px",marginBottom:"16px"},
  authBtn:      {width:"100%",background:"#E8520A",border:"none",color:"#fff",padding:"14px",fontSize:"13px",fontWeight:700,cursor:"pointer",borderRadius:"4px"},
  hint:         {fontSize:"11px",color:"rgba(240,240,240,0.25)",marginTop:"16px",textAlign:"center"},
  header:       {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 32px",background:"#1a1a1a",borderBottom:"1px solid rgba(232,82,10,0.15)"},
  hLeft:        {display:"flex",alignItems:"center",gap:"12px"},
  logoutBtn:    {background:"none",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(240,240,240,0.45)",padding:"7px 16px",fontSize:"12px",cursor:"pointer",borderRadius:"4px"},
  statsRow:     {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"rgba(255,255,255,0.04)",margin:"24px 32px 0",border:"1px solid rgba(255,255,255,0.06)"},
  statCard:     {background:"#1a1a1a",padding:"20px 24px"},
  statNum:      {fontSize:"30px",fontWeight:700,lineHeight:1,marginBottom:"6px"},
  statLbl:      {fontSize:"10px",color:"rgba(240,240,240,0.35)",letterSpacing:"1px",textTransform:"uppercase"},
  toolbar:      {display:"flex",alignItems:"center",gap:"10px",padding:"20px 32px",flexWrap:"wrap"},
  searchInp:    {flex:1,minWidth:"180px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",padding:"10px 14px",color:"#f0f0f0",fontSize:"14px",outline:"none",borderRadius:"4px"},
  filterRow:    {display:"flex",gap:"6px"},
  filterBtn:    {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(240,240,240,0.45)",padding:"8px 14px",fontSize:"12px",cursor:"pointer",borderRadius:"4px"},
  filterBtnOn:  {background:"rgba(232,82,10,0.15)",borderColor:"rgba(232,82,10,0.4)",color:"#E8520A",fontWeight:600},
  resetBtn:     {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(240,240,240,0.35)",padding:"8px 14px",fontSize:"12px",cursor:"pointer",borderRadius:"4px"},
  catTabs:      {display:"flex",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 32px"},
  catTab:       {background:"none",border:"none",borderBottom:"2px solid transparent",color:"rgba(240,240,240,0.4)",padding:"12px 20px",fontSize:"13px",fontWeight:500,cursor:"pointer",marginBottom:"-1px",whiteSpace:"nowrap"},
  catTabOn:     {color:"#E8520A",borderBottomColor:"#E8520A",fontWeight:700},
  catBadge:     {background:"rgba(255,255,255,0.08)",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",marginLeft:"8px"},
  tableWrap:    {margin:"24px 32px",background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"4px",overflow:"hidden"},
  table:        {width:"100%",borderCollapse:"collapse"},
  th:           {padding:"12px 16px",textAlign:"left",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(240,240,240,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:600},
  tr:           {},
  td:           {padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"14px",verticalAlign:"middle"},
  empty:        {padding:"32px",textAlign:"center",color:"rgba(240,240,240,0.25)",fontSize:"14px"},
  thumb:        {width:"52px",height:"44px",objectFit:"cover",borderRadius:"4px",display:"block"},
  thumbEmpty:   {width:"52px",height:"44px",background:"rgba(255,255,255,0.04)",borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"rgba(240,240,240,0.2)",textAlign:"center"},
  unavailPill:  {background:"rgba(229,62,62,0.12)",color:"#fc8181",fontSize:"10px",padding:"2px 8px",borderRadius:"10px",marginLeft:"10px",fontWeight:600},
  tagPill:      {background:"rgba(232,82,10,0.12)",color:"#E8520A",fontSize:"11px",padding:"3px 10px",borderRadius:"10px",fontWeight:600},
  toggleBtn:    {border:"none",padding:"5px 12px",fontSize:"11px",fontWeight:700,cursor:"pointer",borderRadius:"20px"},
  togOn:        {background:"rgba(11,163,79,0.14)",color:"#0ba34f",border:"1px solid rgba(11,163,79,0.3)"},
  togOff:       {background:"rgba(229,62,62,0.1)",color:"#fc8181",border:"1px solid rgba(229,62,62,0.25)"},
  editBtn:      {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(240,240,240,0.7)",padding:"6px 12px",fontSize:"12px",cursor:"pointer",borderRadius:"4px"},
  delBtn:       {background:"rgba(229,62,62,0.08)",border:"1px solid rgba(229,62,62,0.2)",color:"#fc8181",padding:"6px 10px",fontSize:"13px",cursor:"pointer",borderRadius:"4px"},
  addBtn:       {width:"100%",background:"rgba(232,82,10,0.07)",border:"1px dashed rgba(232,82,10,0.3)",color:"#E8520A",padding:"16px",fontSize:"13px",fontWeight:600,cursor:"pointer"},
  backdrop:     {position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",overflowY:"auto"},
  modal:        {background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",padding:"32px",width:"100%",maxWidth:"500px",borderRadius:"6px",maxHeight:"90vh",overflowY:"auto"},
  modalTitle:   {fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:700,color:"#f0f0f0",marginBottom:"22px"},
  modalFoot:    {display:"flex",gap:"12px",marginTop:"28px"},
  cancelBtn:    {flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(240,240,240,0.6)",padding:"12px",fontSize:"13px",cursor:"pointer",borderRadius:"4px"},
  saveBtn:      {flex:1,background:"#E8520A",border:"none",color:"#fff",padding:"12px",fontSize:"13px",fontWeight:700,cursor:"pointer",borderRadius:"4px"},
  radioLbl:     {fontSize:"14px",color:"rgba(240,240,240,0.65)",display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"},
  photoRow:     {display:"flex",alignItems:"center",gap:"16px"},
  photoPreview: {width:"80px",height:"70px",objectFit:"cover",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)"},
  photoEmpty:   {width:"80px",height:"70px",background:"rgba(255,255,255,0.04)",borderRadius:"6px",border:"1px dashed rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"rgba(240,240,240,0.25)",textAlign:"center"},
  photoActions: {display:"flex",flexDirection:"column",gap:"8px"},
  uploadBtn:    {background:"rgba(232,82,10,0.12)",border:"1px solid rgba(232,82,10,0.3)",color:"#E8520A",padding:"8px 14px",fontSize:"12px",fontWeight:600,cursor:"pointer",borderRadius:"4px"},
  removePhotoBtn:{background:"rgba(229,62,62,0.08)",border:"1px solid rgba(229,62,62,0.2)",color:"#fc8181",padding:"6px 14px",fontSize:"11px",cursor:"pointer",borderRadius:"4px"},
  progressBar:  {height:"4px",background:"rgba(255,255,255,0.08)",borderRadius:"2px",overflow:"hidden",marginTop:"8px"},
  progressFill: {height:"100%",background:"#E8520A",borderRadius:"2px",transition:"width .2s"},
  toast:        {position:"fixed",bottom:"28px",left:"50%",transform:"translateX(-50%)",padding:"12px 24px",borderRadius:"4px",fontSize:"13px",fontWeight:600,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"},
  toastOk:      {background:"#0ba34f",color:"#fff"},
  toastErr:     {background:"#e53e3e",color:"#fff"},
  savingBar:    {position:"fixed",top:0,left:0,right:0,background:"rgba(232,82,10,0.9)",color:"#fff",fontSize:"12px",fontWeight:600,textAlign:"center",padding:"6px",zIndex:9998,letterSpacing:"1px"},
  spinner:      {width:"32px",height:"32px",border:"3px solid rgba(232,82,10,0.2)",borderTopColor:"#E8520A",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto"},
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  @keyframes spin { to { transform: rotate(360deg); } }
  input:focus, select:focus, textarea:focus { border-color: rgba(232,82,10,0.5) !important; outline: none; }
  button:hover:not(:disabled) { filter: brightness(1.1); }
  tr:hover td { background: rgba(255,255,255,0.015); }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input[type=file] { display: none; }
  @media (max-width: 768px) {
    header { padding: 14px 16px !important; }
    .stats { grid-template-columns: 1fr 1fr !important; }
    div[style*="margin: 24px 32px"] { margin: 16px !important; }
    div[style*="padding: 20px 32px"] { padding: 14px 16px !important; }
    div[style*="padding: 0 32px"] { padding: 0 16px !important; }
  }
`;