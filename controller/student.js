const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new Student Details
const register = async (req, res) => {
  try {
    const { email, age, name, collegeName } = req.body;

    if (!email || !age || !name) {
      return res.status(400).send("Credentials are missing");
    }
    
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format.");
    }

    if (isNaN(age) || age <= 0) {
      return res.status(400).send("Invalid age. Age must be a positive number.");
    }

    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).send("Invalid Name Format");
    }

    let studentData = {
      name,
      email,
      age,
    };

    if (collegeName) {
      studentData.colleges = {
        create: {
          name: collegeName,
        },
      };
    }

    const createStud = await prisma.student.create({
      data: studentData,
      include: {
        colleges: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ message: 'Student created successfully', student: createStud });
  } catch (error) {
    if(error.code === 'P2002' && error.meta?.target.includes('email')) {
      console.error('Duplicate email address:', error.meta.target);
      res.send("Duplicate Email Address")
    } else {
      console.error('Error:', error);
    }
  }
};



//Create a Many Students Data 
const registerMany = async (req, res) => {
  try {
    const studentDataArray = req.body;

    if (!Array.isArray(studentDataArray)) {
      return res.status(400).send("Invalid input. Expected an array of students.");
    }

    const createdStudents = [];

    for (const studentData of studentDataArray) {
      const { email, age, name, collegeName } = studentData;

      if (!email || !age || !name) {
        return res.status(400).send("Credentials are missing for one or more students.");
      }
      
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send("Invalid email format.");
      }
  
      if (isNaN(age) || age <= 0) {
        return res.status(400).send("Invalid age. Age must be a positive number.");
      }
  
      const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/;
      if (!nameRegex.test(name)) {
        return res.status(400).send("Invalid Name Format");
      }
  
      const studentDataWithCollege = collegeName
        ? {
            name,
            email,
            age,
            colleges: {
              create: {
                name: collegeName,
              },
            },
          }
        : {
            name,
            email,
            age,
          };

      const createdStudent = await prisma.student.create({
        data: studentDataWithCollege,
        include: {
          colleges: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      createdStudents.push(createdStudent);
    }

    res.json({
      message: 'Students created successfully',
      students: createdStudents,
    });
  } catch (error) {
    if(error.code === 'P2002' && error.meta?.target.includes('email')) {
      console.error('Duplicate email address:', error.meta.target);
      res.send("Duplicate email Address")
    } else {
      console.error('Error:', error);
    }
  }
};



//Get all students details
const getAll= async (req, res) => {
  try{
  const users = await prisma.student.findMany({
    include: {
      colleges: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  res.json(users);
  }
  catch(error){
    res.status(404).send({ error: "Users not found"})
  }
};



//Get a students Details by Id
const getById = async (req, res) => {
  try {
    const { id } = req.params; 

    // if (!req.body) {
    //   return res.status(400).send({ error: "Empty or invalid request body" });
    // }

    const user = await prisma.student.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        colleges: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: "Internal server error" }); 
  }
};



//Update a Student and Colleges By ID
// const updateById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, age, email, collegeName } = req.body;

//     const student = await prisma.student.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     const updateData = {};

//     if (name !== undefined && name !== null) {
//       const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/;
//       if (!nameRegex.test(name)) {
//         return res.status(400).send("Invalid Name Format");
//       }
//       updateData.name = name;
//     }

//     if (age !== undefined && age !== null) {
//       if (isNaN(age) || age <= 0) {
//         return res.status(400).send("Invalid age. Age must be a positive number.");
//       }
//       updateData.age = age;
//     }

//     if (email !== undefined && email !== null) {
//       const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
//       if (!emailRegex.test(email)) {
//         return res.status(400).send("Invalid email format.");
//       }
//       updateData.email = email;
//     }

//     if (collegeName !== undefined && collegeName !== null) {
//       const college = await prisma.college.findFirst({
//         where: {
//           studentID: student.id, 
//         },
//       });
//       if (college) {
//         await prisma.college.update({
//           where: {
//             id: college.id,
//           },
//           data: {
//             name: collegeName,
//           },
//         });
//       } else {
//         await prisma.college.create({
//           data: {
//             name: collegeName,
//             student: {
//               connect: {
//                 id: parseInt(id),
//               },
//             },
//           },
//         });
//       }
//     }

//     const updatedStudent = await prisma.student.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: updateData,
//       include: {
//         colleges: true, 
//       },
//     });

//     res.json({ message: 'Student and college information updated successfully', student: updatedStudent });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while updating the student and college information' });
//   }
// };



// Delete a student by ID
const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await prisma.student.delete({
      where: {
        id: parseInt(id),
      },
      include: {
        colleges: true
      },
    });

    if (deletedStudent) {
      res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } else {
      res.status(404).send({ error: "Student not found" });
    }
  } catch (error) {
    //console.error(error);
    res.status(404).json({ error: 'Student not found' });
  }
};



//Delete all students data
// const deleteAll = async (req, res) => {
//   try {
//     const deleteStudents = await prisma.student.deleteMany();
//     res.json({ message: 'All students and their associated colleges deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while deleting all students and colleges' });
//   }
// };



// Update a student by ID
const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, age, name, collegeName } = req.body;

    if (!email || !age || !name) {
      return res.status(400).send("Credentials are missing.");
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format.");
    }

    if (isNaN(age) || age <= 0) {
      return res.status(400).send("Invalid age. Age must be a positive number.");
    }

    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).send("Invalid Name Format");
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        email,
        age,
        colleges: {
           upsert: {
             where: { id: parseInt(id) }, 
             update: { name: collegeName },
             create: { name: collegeName },
           },
        },
      },
      include: {
        colleges: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    if(error.code === 'P2002' && error.meta?.target.includes('email')) {
      console.error('Duplicate email address:', error.meta.target);
      res.send("Duplicate email Address")
    } else {
      console.error('Error:', error);
    }
  }
};

module.exports = {
  register,
  getAll,
  getById,
  registerMany,
  updateById,
  deleteById,
  //deleteAll
};