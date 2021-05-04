let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (e) {
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log("Error funcion" + e.target.errorCode);
};

function saveRecord(rec) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(rec);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
         
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");

          
          store.clear();
        });
    }
  };
}
window.addeListener("online", checkDatabase);
