
-- Organization and Resources --
CREATE TABLE Departments (
    departmentId INT PRIMARY KEY,
    departmentName VARCHAR(150) NOT NULL
); 

-- Service Operations --
CREATE TABLE ServiceCatalog (
    serviceTypeId INT PRIMARY KEY, 
    serviceName VARCHAR(255) NOT NULL,
    departmentId INT NOT NULL REFERENCES Departments(departmentId)
);

-- Organization and Resources -- 
CREATE TABLE Teams (
    teamId INT PRIMARY KEY, 
    departmentId INT NOT NULL REFERENCES Departments(departmentId), 
    teamName VARCHAR(150) NOT NULL
);

-- Organization and Resources -- 
CREATE TABLE Staffing (
    staffingId INT PRIMARY KEY, 
    teamId INT NOT NULL REFERENCES Teams(teamId), 
    date DATE NOT NULL, 
    availableHours DECIMAL(8,2) NOT NULL,
    -- Each team can have only one staffing record per day
    CONSTRAINT UQ_Staffing_TeamDate UNIQUE (teamId, date)
);

-- Organization and Resources --
CREATE TABLE OperationalEvents (
    eventId INT PRIMARY KEY, 
    departmentId INT NOT NULL REFERENCES Departments(departmentId),
    teamId INT NULL REFERENCES Teams(teamId),
    eventType VARCHAR(100) NOT NULL, 
    startAt DATETIME2 NOT NULL, 
    endAt DATETIME2 NULL, 
    description VARCHAR(MAX) NOT NULL, 
    capacityImpactHours DECIMAL(8,2) NOT NULL
);


-- Service Operations --
CREATE TABLE ServiceTargets (
    targetId INT PRIMARY KEY, 
    serviceTypeId INT NOT NULL REFERENCES ServiceCatalog(serviceTypeId),
    priority VARCHAR(30) NOT NULL, 
    responseHours INT NOT NULL, 
    completionHours INT NOT NULL, 
    -- Each service type can have only one target per priority level
    CONSTRAINT UQ_ServiceTargets_TypePriority UNIQUE (serviceTypeId, priority)
);

-- Service Operations --
CREATE TABLE ServiceRequests (
    serviceRequestId VARCHAR(50) PRIMARY KEY, 
    serviceTypeId INT NOT NULL REFERENCES ServiceCatalog(serviceTypeId), 
    name VARCHAR(255) NOT NULL, 
    description VARCHAR(MAX) NULL, 
    status VARCHAR(50), 
    createdAt DATETIME2 NOT NULL, 
    updatedAt DATETIME2 NOT NULL, 
    latitude DECIMAL(10,7) NOT NULL, 
    longitude DECIMAL(10,7) NOT NULL, 
    address VARCHAR(255) NOT NULL, 
    permission VARCHAR(50) NOT NULL, 
    sourceSystem VARCHAR(100) NOT NULL
);

-- Service Operations --
CREATE TABLE WorkOrders (
    workOrderId INT PRIMARY KEY, 
    serviceRequestId VARCHAR(50) NOT NULL UNIQUE REFERENCES ServiceRequests(serviceRequestId), 
    teamId INT NOT NULL REFERENCES Teams(teamId), 
    status VARCHAR(50) NOT NULL, 
    priority VARCHAR(30) NOT NULL, 
    createdAt DATETIME2 NOT NULL, 
    dueAt DATETIME2 NOT NULL, 
    completedAt DATETIME2 NULL,
    estimatedHours DECIMAL(8,2), 
    actualHours DECIMAL(8,2)
);

-- Service Operations --
CREATE TABLE WorkOrderStatusHistory (
    historyId INT PRIMARY KEY, 
    workOrderId INT NOT NULL REFERENCES WorkOrders(workOrderId),
    status VARCHAR(50) NOT NULL, 
    changedAt DATETIME2 NOT NULL
);

-- Monitoring and AI Investigations --
CREATE TABLE Alerts (
    alertId INT PRIMARY KEY, 
    departmentId INT NULL REFERENCES Departments(departmentId), 
    alertType VARCHAR(100), 
    severity VARCHAR(30),
    detectedAt DATETIME2, 
    status VARCHAR(30), 
    description VARCHAR(MAX)
);

-- Monitoring and AI Investigations --
CREATE TABLE Investigations (
    investigationId INT PRIMARY KEY, 
    alertId INT NULL REFERENCES Alerts(alertId), 
    startedAt DATETIME2 NOT NULL, 
    completedAt DATETIME2 NULL, 
    status VARCHAR(30) NOT NULL, 
    findings VARCHAR(MAX), 
    recommendations VARCHAR(MAX), 
    evidence VARCHAR(MAX)
);

-- An alert can have only one investigation
-- Investigations without an alert are also allowed
CREATE UNIQUE INDEX UX_Investigations_AlertId ON Investigations(alertId) WHERE alertId IS NOT NULL;