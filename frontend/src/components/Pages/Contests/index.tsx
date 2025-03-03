// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:8081');

// function ContestsList() {
//   const [users, setUsers] = useState([]);
//   const contestId = '67c538c49d5c1d30674ae224';
//   console.log(socket)
//   useEffect(() => {
//     // เข้าร่วม contest
//     socket.emit('joinContest', { contestId, userId: 'user124' });

//     // รับการอัปเดตผู้ใช้
//     socket.on('userUpdate', (data) => {
//       setUsers(data.users);
//     });

//     // ออกเมื่อ component unmount
//     return () => {
//       socket.emit('leaveContest', contestId);
//       socket.off('userUpdate');
//     };
//   }, [contestId]);

//   return (
//     <div>
//       <h1>Contest: {contestId}</h1>
//       <h2>Users in Contest:</h2>
//       <ul>
//         {users.map((userId) => (
//           <li key={userId}>{userId}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default ContestsList;