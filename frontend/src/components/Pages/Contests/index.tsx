const socket = new WebSocket("ws://localhost:8081");

function ContestsList() {
  socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
  });


  return (
    <>
      {/* <HomeNavbar />
      <main className="tw-mt-4">
        <ContestsSet />
      </main>
      <Footer /> */}
    </>
  );
}

export default ContestsList;