const API_BASE_URL = process.env.API_URL || 'https://backend-hour-app.vercel.app';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
};

export const fetchProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const updateCoordinator = async (email, projectID) => {
  const response = await fetch(`${API_BASE_URL}/projects/updateCoordinator`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, projectID }),
  });
  return response.json();
};

export const fetchOrgTeamsByUser = async (userID) => {
  const response = await fetch(`${API_BASE_URL}/orgTeams/byUser`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userID }),
  });
  return response.json();
};

export const fetchOrgTeamsByProject = async (projectID) => {
  const response = await fetch(`${API_BASE_URL}/orgTeams/byProject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectID }),
  });
  return response.json();
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'An error occurred during login');
  }
};

// New function for Google authentication
export const loginWithGoogle = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/googleLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Google login failed');
    }
    
    // Store JWT token for API calls
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'An error occurred during Google login');
  }
};

export const addUserToDepartment = async (userId, departmentId) => {
  const response = await fetch(`${API_BASE_URL}/users/addToDepartment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, departmentId }),
  });
  return response.json();
};

export const updateUser = async (userId, updates) => {
  const response = await fetch(`${API_BASE_URL}/users/update/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user');
  }
  
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const addProject = async (projectID, name, coordinatorID) => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectID, name, coordinatorID }),
  });
  return response.json();
};

export const addUserToOrgTeam = async (userID, projectID) => {
  const response = await fetch(`${API_BASE_URL}/orgTeams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userID, projectID }),
  });
  return response.json();
};

export const deleteUserFromOrgTeam = async (userID, projectID) => {
  const response = await fetch(`${API_BASE_URL}/orgTeams/delete`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userID, projectID }),
  });
  return response.json();
};

export const fetchAllTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};


export const fetchTasks = async (projectID) => {
  if (!projectID) {
    return fetchAllTasks();
  }
  const response = await fetch(`${API_BASE_URL}/tasks/project/${projectID}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};


export const addTask = async (task) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return response.json();
};

export const updateTask = async (taskID, updates) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskID}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return response.json();
};

export const deleteTask = async (taskID) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskID}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const fetchDepartments = async () => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const addDepartmentCoordinator = async (email, departmentID) => {
  const response = await fetch(`${API_BASE_URL}/departments/addCoordinator`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, departmentID }),
  });
  if (!response.ok) {
    throw new Error('Failed to add coordinator');
  }
  return response.json();
};

export const fetchTasksByDepartment = async (departmentID) => {
  const response = await fetch(`${API_BASE_URL}/taskDepartments/department/${departmentID}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};
export const addDepartmentTask = async (task) => {
  const response = await fetch(`${API_BASE_URL}/taskDepartments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return response.json();
};

export const updateDepartmentTask = async (taskID, updates) => {
  const response = await fetch(`${API_BASE_URL}/taskDepartments/${taskID}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return response.json();
};

export const deleteDepartmentTask = async (taskID) => {
  const response = await fetch(`${API_BASE_URL}/taskDepartments/${taskID}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return response.json();
};
export const fetchDepartmentMembers = async (departmentId) => {
  const response = await fetch(`${API_BASE_URL}/users/byDepartment/${departmentId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return response.json();
};