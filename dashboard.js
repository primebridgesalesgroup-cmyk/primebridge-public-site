"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const portfolio = window.createAPlusPortfolio();
  const sections = {
    portfolio: ["Portfolio", "Your assets, accounts and activity in one place."],
    send: ["Send", "Review supported transfers and wallet permissions."],
    receive: ["Receive", "Your selected wallet account and network."],
    "buy-sell": ["Buy / Sell", "Supported purchase and sale services."],
    settings: ["Settings", "Account preferences and wallet network information."],
    assets: ["Your assets", "Track connected wallet holdings and find your asset categories."],
    wallets: ["Accounts", "Choose a browser wallet and read its selected account and network."],
    ledger: ["Your ledger", "Customer transactions, fees and confirmations belong in one record."],
    blockchain: ["Blockchain updates", "Customer announcements, upcoming services and the A+ roadmap."],
    exchange: ["Exchange", "A single place for listings, orders and settlement connections."],
    licenses: ["Code & API licenses", "Keep release versions, lease periods and access records together."],
    security: ["Security & privacy", "Understand your connections and how this workspace handles data."],
    account: ["Customer account", "Customer sign-in options and access to private services."]
  };
  const chains = {
    "1": ["Ethereum", "ETH"], "11155111": ["Ethereum Sepolia", "ETH"],
    "8453": ["Base", "ETH"], "42161": ["Arbitrum One", "ETH"],
    "10": ["OP Mainnet", "ETH"], "137": ["Polygon", "POL"]
  };
  const state = {provider: null, account: "", chain: "", native: null, block: "", updated: "", tokens: [], revision: 0, busy: false};
  const providers = new Map();
  const addressPattern = /^0x[0-9a-fA-F]{40}$/;
  const hexPattern = /^0x[0-9a-fA-F]+$/;
  let detach = () => {};
  let pendingConnection = false;
  let tokenPending = false;
  const short = address => address.slice(0, 6) + "…" + address.slice(-4);
  const tell = message => { $("workspace-message").textContent = message; };
  const name = chain => chains[chain]?.[0] || "Chain " + chain;
  const symbol = chain => chains[chain]?.[1] || "base units";
  function quantity(value, decimals) {
    if (typeof value !== "bigint" || value < 0n || !Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error("invalid_quantity");
    const text = value.toString().padStart(decimals + 1, "0");
    if (!decimals) return text;
    const whole = text.slice(0, -decimals), fraction = text.slice(-decimals).replace(/0+$/, "");
    return whole + (fraction ? "." + fraction : "");
  }
  const mobileMenu = matchMedia("(max-width: 900px)");
  let menuOpen = false;
  function setMenu(open, restoreFocus = true) {
    menuOpen = open && mobileMenu.matches;
    document.body.classList.toggle("ledger-nav-open", menuOpen);
    $("ledger-menu-toggle").setAttribute("aria-expanded", String(menuOpen));
    $("ledger-menu-backdrop").hidden = !menuOpen;
    $("ledger-sidebar").inert = mobileMenu.matches && !menuOpen;
    $("main").inert = menuOpen;
    $("ledger-app-header").inert = menuOpen;
    if (menuOpen) $("ledger-menu-close").focus();
    else if (restoreFocus && mobileMenu.matches) $("ledger-menu-toggle").focus();
  }
  function showSection(focus = true) {
    const requested = location.hash.slice(1);
    if (requested === "main") { setMenu(false, false); $("workspace-title").focus(); return; }
    const aliases = {accounts:"wallets",activity:"ledger","code-bank":"licenses",dashboard:"portfolio"};
    const alias = Object.hasOwn(aliases, requested) ? aliases[requested] : "";
    const route = !requested ? "portfolio" : alias || (Object.hasOwn(sections, requested) ? requested : "route-error");
    if (alias) history.replaceState(null, "", "#" + route);
    const details = sections[route] || ["Section unavailable", "This link does not match a ledger section."];
    setMenu(false, false);
    document.body.dataset.route = route;
    document.querySelectorAll(".workspace-section").forEach(section => { section.hidden = section.id !== route; });
    document.querySelectorAll("[data-section]").forEach(link => {
      if (link.dataset.section === route) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    $("workspace-title").textContent = details[0];
    $("workspace-description").textContent = details[1];
    $("workspace-summary").hidden = route !== "wallets";
    document.title = details[0] + " | A+ customer workspace";
    if (focus) { $("workspace-title").focus({preventScroll:true}); window.scrollTo(0, 0); }
  }
  function holdings() {
    if (!state.account || state.native === null) return [];
    return [{name: chains[state.chain] ? name(state.chain) : "Native balance", detail: symbol(state.chain), category: "native", categoryName: "Native currency", chain: name(state.chain), quantity: quantity(state.native, chains[state.chain] ? 18 : 0), source: "Wallet provider"}, ...state.tokens.map(token => ({name: token.symbol, detail: token.address, category: "token", categoryName: "Tokens", chain: name(state.chain), quantity: quantity(token.balance, token.decimals), source: "Contract read"}))];
  }
  function filteredHoldings(prefix = "") {
    const search = $(prefix + "asset-search").value.trim().toLowerCase(), category = $(prefix + "asset-category").value;
    return holdings().filter(row => (category === "all" || category === row.category) && [row.name, row.detail, row.categoryName].join(" ").toLowerCase().includes(search));
  }
  function renderAssets() {
    const body = $("asset-rows"), rows = filteredHoldings();
    body.replaceChildren();
    $("export-assets").disabled = rows.length === 0;
    if (!rows.length) {
      const tr = document.createElement("tr"), td = document.createElement("td"), heading = document.createElement("strong");
      td.colSpan = 5; td.className = "empty-cell";
      heading.textContent = state.busy ? "Reading your wallet…" : !state.account ? "No holdings loaded." : $("asset-category").value !== "all" || $("asset-search").value ? "No displayed holdings match this filter." : "Wallet balance is not available.";
      const explanation = ["physical", "energy", "code", "rights"].includes($("asset-category").value) ? "This category requires authenticated service records. The service is not connected." : "Only successful wallet reads appear here. Private account records are not connected.";
      td.append(heading, document.createTextNode(explanation)); tr.append(td); body.append(tr); return;
    }
    for (const row of rows) {
      const tr = document.createElement("tr"), asset = document.createElement("td"), title = document.createElement("strong"), detail = document.createElement("small");
      asset.className = "asset-name"; title.textContent = row.name; detail.textContent = row.detail + " · " + row.chain; asset.append(title, detail); tr.append(asset);
      for (const value of [row.categoryName, row.quantity, "—", row.category === "native" ? "Wallet read" : "Contract read · unverified"]) { const cell = document.createElement("td"); cell.textContent = value; tr.append(cell); }
      body.append(tr);
    }
  }
  function render() {
    const connected = Boolean(state.account), readable = connected && state.native !== null;
    $("connection-status").dataset.connected = String(connected);
    $("connection-label").textContent = connected ? "Wallet connected" : "Wallet offline";
    $("summary-wallet").textContent = connected ? short(state.account) : "Not connected";
    $("summary-network").textContent = state.chain ? name(state.chain) : "—";
    $("summary-chain").textContent = state.chain ? "Chain ID " + state.chain : "Connect to read chain identity";
    $("summary-holdings").textContent = readable ? String(holdings().length) : "—";
    $("summary-updated").textContent = state.updated ? "Last read " + state.updated : "No balance read yet";
    $("wallet-address").textContent = state.account || "Not connected";
    $("wallet-network").textContent = state.chain ? name(state.chain) + " · " + state.chain : "Not read";
    $("wallet-balance").textContent = readable ? quantity(state.native, chains[state.chain] ? 18 : 0) + " " + symbol(state.chain) : "Not read";
    $("wallet-updated").textContent = state.updated || "Not read";
    $("chain-name").textContent = state.chain ? name(state.chain) : "Not read";
    $("chain-id").textContent = state.chain || "Not read";
    $("chain-block").textContent = state.block || "Not read";
    $("network-read-status").textContent = state.block ? "Provider response" : "Not read";
    $("connect-wallet").disabled = pendingConnection || state.busy;
    $("connect-wallet").textContent = connected ? "Reconnect wallet" : "Connect wallet";
    $("wallet-provider").disabled = connected || pendingConnection;
    $("refresh-wallet").disabled = !connected || state.busy;
    $("disconnect-wallet").disabled = !connected && !pendingConnection;
    $("add-token").disabled = !readable || state.busy || tokenPending;
    $("receive-address").textContent = readable ? state.account : "No account selected";
    $("receive-network").textContent = readable ? name(state.chain) + " · " + state.chain : "Not read";
    $("copy-receive-address").disabled = !readable;
    $("ledger-network-status").textContent = state.block ? "Wallet network · " + name(state.chain) + " · Block " + state.block : "Network not read";
    portfolio.render({account: connected ? short(state.account) : "", network: state.chain ? name(state.chain) : "", readable, balance: readable ? quantity(state.native, chains[state.chain] ? 18 : 0) + " " + symbol(state.chain) : "", rows: filteredHoldings("portfolio-"), hasHoldings: holdings().length > 0});
    renderAssets();
  }
  function clearReads() { state.chain = ""; state.native = null; state.block = ""; state.updated = ""; state.tokens = []; }
  function disconnected(message = "Disconnected from this page. Wallet permissions can be revoked in your wallet settings.") {
    state.revision++; detach(); detach = () => {}; state.provider = null; state.account = ""; state.busy = false; pendingConnection = false; tokenPending = false; clearReads(); $("token-contract").value = ""; render(); tell(message);
  }
  async function rpc(provider, method, params = []) {
    let timer;
    try { return await Promise.race([Promise.resolve().then(() => provider.request({method, params})), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("wallet_timeout")), 12000); })]); }
    finally { clearTimeout(timer); }
  }
  function uint(raw) {
    if (typeof raw !== "string" || !hexPattern.test(raw) || raw.length > 66) throw new Error("invalid_rpc_quantity");
    return BigInt(raw);
  }
  async function readAll() {
    if (!state.provider || !state.account) return;
    const provider = state.provider, account = state.account, previousChain = state.chain, tracked = state.tokens.map(token => token.address), revision = ++state.revision;
    // Clear stale balances immediately on refresh, wallet changes and failed reads.
    state.busy = true; clearReads(); render(); tell("Reading balances from your wallet provider…");
    try {
      const chain = uint(await rpc(provider, "eth_chainId")).toString();
      const [balanceRaw, blockRaw] = await Promise.all([rpc(provider, "eth_getBalance", [account, "latest"]), rpc(provider, "eth_blockNumber")]);
      const tokens = [];
      if (chain === previousChain) for (const address of tracked) tokens.push(await readToken(provider, account, address));
      const finalChain = uint(await rpc(provider, "eth_chainId")).toString();
      if (revision !== state.revision) return;
      if (chain !== finalChain || state.account !== account) throw new Error("wallet_changed");
      state.chain = chain; state.native = uint(balanceRaw); state.block = uint(blockRaw).toString(); state.tokens = tokens; state.updated = new Date().toLocaleTimeString();
      tell("Wallet data refreshed. Balances are reported by your provider; private customer records are not connected.");
    } catch {
      if (revision === state.revision) { clearReads(); tell("Wallet data could not be read. Check the selected network and wallet connection, then refresh. Stale balances have been cleared."); }
    } finally { if (revision === state.revision) { state.busy = false; render(); } }
  }
  function bindProvider(provider) {
    const accountsChanged = accounts => {
      if (state.provider !== provider) return;
      if (!Array.isArray(accounts) || !addressPattern.test(accounts[0] || "")) { disconnected("Your wallet no longer exposes an account. Page data was cleared."); return; }
      state.tokens = []; state.account = accounts[0]; void readAll();
    };
    const chainChanged = () => { if (state.provider === provider) { state.tokens = []; void readAll(); } };
    const disconnect = () => { if (state.provider === provider) disconnected("Wallet connection ended. Page data was cleared."); };
    if (typeof provider.on === "function") { provider.on("accountsChanged", accountsChanged); provider.on("chainChanged", chainChanged); provider.on("disconnect", disconnect); }
    detach = () => { if (typeof provider.removeListener === "function") { provider.removeListener("accountsChanged", accountsChanged); provider.removeListener("chainChanged", chainChanged); provider.removeListener("disconnect", disconnect); } };
  }
  async function connect() {
    if (pendingConnection || state.busy) return;
    const entry = providers.get($("wallet-provider").value);
    if (!entry) { location.hash = "wallets"; tell("No compatible browser wallet was detected. Open this site in your wallet’s browser or enable a browser-wallet extension."); return; }
    disconnected(""); pendingConnection = true; const revision = state.revision; render(); tell("Choose an account in your wallet. No signature or transaction is requested.");
    try {
      // Permission prompts may remain open; revision prevents late responses restoring a disconnected session.
      const accounts = await entry.provider.request({method: "eth_requestAccounts"});
      if (revision !== state.revision) return;
      if (!Array.isArray(accounts) || !addressPattern.test(accounts[0] || "")) throw new Error("invalid_account");
      state.provider = entry.provider; state.account = accounts[0]; bindProvider(entry.provider); pendingConnection = false; await readAll();
    } catch { if (revision === state.revision) disconnected("Wallet connection was not completed. You can try again when ready."); }
    finally { if (revision === state.revision) { pendingConnection = false; render(); } }
  }
  function addProvider(key, provider, providerName) {
    if (!provider || typeof provider.request !== "function" || providers.has(key)) return;
    if ([...providers.values()].some(entry => entry.provider === provider)) return;
    providers.set(key, {provider, name: String(providerName || "Browser wallet").slice(0, 60)});
    const current = $("wallet-provider").value; $("wallet-provider").replaceChildren();
    for (const [id, entry] of providers) { const option = document.createElement("option"); option.value = id; option.textContent = entry.name; $("wallet-provider").append(option); }
    if (providers.has(current)) $("wallet-provider").value = current;
  }
  function decodeSymbol(raw) {
    if (typeof raw !== "string" || !/^0x[0-9a-fA-F]*$/.test(raw) || raw.length > 4098) return "ERC-20";
    const hex = raw.slice(2); let text = "";
    if (hex.length === 64) { for (let i = 0; i < 64; i += 2) text += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)); }
    else if (hex.length >= 128 && uint("0x" + hex.slice(0, 64)) === 32n) {
      const length = uint("0x" + hex.slice(64, 128));
      if (length > 64n || hex.length < 128 + Number(length) * 2) return "ERC-20";
      const bytes = new Uint8Array(Number(length));
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(128 + i * 2, 130 + i * 2), 16);
      try { text = new TextDecoder("utf-8", {fatal: true}).decode(bytes); } catch { return "ERC-20"; }
    }
    return text.replace(/[^a-zA-Z0-9 ._+-]/g, "").trim().slice(0, 32) || "ERC-20";
  }
  async function readToken(provider, account, address) {
    const [balance, decimalsRaw, symbolRaw] = await Promise.all([
      rpc(provider, "eth_call", [{to: address, data: "0x70a08231" + account.slice(2).toLowerCase().padStart(64, "0")}, "latest"]),
      rpc(provider, "eth_call", [{to: address, data: "0x313ce567"}, "latest"]),
      rpc(provider, "eth_call", [{to: address, data: "0x95d89b41"}, "latest"]).catch(() => "0x")
    ]);
    const decimals = uint(decimalsRaw);
    if (decimals > 36n) throw new Error("unsupported_decimals");
    return {address, balance: uint(balance), decimals: Number(decimals), symbol: decodeSymbol(symbolRaw)};
  }
  async function addToken(event) {
    event.preventDefault();
    if (!state.provider || !state.account || state.native === null || tokenPending || state.busy) return;
    const address = $("token-contract").value.trim();
    if (!addressPattern.test(address)) { tell("Enter a valid 0x contract address for the selected network."); return; }
    if (state.tokens.some(token => token.address.toLowerCase() === address.toLowerCase())) { tell("That contract is already displayed."); return; }
    if (state.tokens.length >= 20) { tell("This page supports up to 20 manually tracked token contracts per connection."); return; }
    const revision = state.revision, provider = state.provider, account = state.account, chain = state.chain;
    tokenPending = true; render(); tell("Reading the contract on your wallet’s current network…");
    try {
      const token = await readToken(provider, account, address);
      const confirmedChain = uint(await rpc(provider, "eth_chainId")).toString();
      if (revision !== state.revision) return;
      if (confirmedChain !== chain) throw new Error("wallet_changed");
      state.tokens.push(token); $("token-contract").value = ""; tell("Token balance added. Contract metadata is self-reported; this does not verify the token.");
    } catch { if (revision === state.revision) tell("That token could not be read. Check its network and contract address. No token was added."); }
    finally { tokenPending = false; render(); }
  }
  function exportAssets() {
    const rows = filteredHoldings(); if (!rows.length) return;
    const cell = value => { let text = String(value); if (/^[=+\-@\t\r]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; };
    const csv = [["Asset", "Category", "Network", "Quantity", "Source", "Contract or symbol"], ...rows.map(row => [row.name, row.categoryName, row.chain, row.quantity, row.source, row.detail])].map(row => row.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"})), link = document.createElement("a");
    link.href = url; link.download = "aplus-wallet-holdings.csv"; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    tell("Displayed holdings exported to your device. This export is not a complete asset inventory or ownership certificate.");
  }
  $("copy-receive-address").addEventListener("click", async () => {
    if (!state.account || state.native === null) return;
    const address = state.account, revision = state.revision;
    try { await navigator.clipboard.writeText(address); if (revision === state.revision) tell("Selected account address copied. Confirm the network in your wallet before receiving assets."); }
    catch { if (revision === state.revision) tell("Clipboard access is unavailable. You can select and copy the displayed account address."); }
  });
  $("open-notifications").addEventListener("click", () => $("notifications-dialog").showModal());
  document.addEventListener("click", event => {
    const anchor = event.target.closest("a[href^='#']");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== anchor.hash) history.pushState(null, "", anchor.hash);
    showSection();
  });
  window.addEventListener("hashchange", () => showSection());
  window.addEventListener("popstate", () => showSection());
  $("ledger-menu-toggle").addEventListener("click", () => setMenu(!menuOpen));
  $("ledger-menu-close").addEventListener("click", () => setMenu(false));
  $("ledger-menu-backdrop").addEventListener("click", () => setMenu(false));
  mobileMenu.addEventListener("change", () => setMenu(false, false));
  document.addEventListener("keydown", event => {
    if (!menuOpen) return;
    if (event.key === "Escape") { event.preventDefault(); setMenu(false); }
    if (event.key === "Tab") {
      const items = [...$("ledger-sidebar").querySelectorAll("a[href],button:not([disabled])")];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $("connect-wallet").addEventListener("click", () => void connect());
  $("refresh-wallet").addEventListener("click", () => void readAll());
  $("disconnect-wallet").addEventListener("click", () => disconnected());
  $("portfolio-asset-search").addEventListener("input", render); $("portfolio-asset-category").addEventListener("change", render);
  $("asset-search").addEventListener("input", renderAssets); $("asset-category").addEventListener("change", renderAssets);
  $("token-form").addEventListener("submit", event => void addToken(event)); $("export-assets").addEventListener("click", exportAssets);
  window.addEventListener("eip6963:announceProvider", event => {
    const detail = event.detail;
    if (typeof detail?.info?.uuid === "string" && detail.info.uuid.length <= 100) addProvider(detail.info.uuid, detail.provider, detail.info.name);
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  if (window.ethereum) addProvider("injected", window.ethereum, "Browser wallet");
  if (!providers.size) { $("wallet-provider").options[0].textContent = "No browser wallet detected"; }
  $("year").textContent = String(new Date().getFullYear()); showSection(false); render();
})();
