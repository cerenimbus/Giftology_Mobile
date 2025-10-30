<?php
// Cerenimbus Inc.
// 1175 N 910 E, Orem UT 84097
// THIS IS NOT OPEN SOURCE. DO NOT USE WITHOUT PERMISSION

/*
GetTaskList
Description:
Get a list of tasks for a User. The User is selected based on the authorization code.
*/

$debugflag = false;

// RKG 10/20/25 allow the debugflag to be switched on in the GET method call
if (isset($_REQUEST["debugflag"])) {
    $debugflag = true;
}

// this stops the java scrip from being written because this is a microservice API
$suppress_javascript = true;

//-------------------------------------
// Include necessary function files with error checking
if (file_exists('ccu_include/ccu_function.php')) {
    require_once('ccu_include/ccu_function.php');
} else {
    if (!file_exists('../ccu_include/ccu_function.php')) {
        echo "Cannot find required file ../ccu_include/ccu_function.php. Contact programmer.";
        exit;
    }
    require_once('../ccu_include/ccu_function.php');
}

// Include send_output.php with error checking
if (file_exists('send_output.php')) {
    require_once('send_output.php');
} else {
    if (!file_exists('../ccu_include/send_output.php')) {
        echo "Cannot find required file ../ccu_include/send_output.php. Contact programmer.";
        exit;
    }
    require_once('../ccu_include/send_output.php');
}

debug("GetTaskList");

//-------------------------------------
// Get the values passed in
$device_ID          = urldecode($_REQUEST["DeviceID"]); //-alphanumeric up to 60 characters which uniquely identifies the mobile device (iphone, ipad, etc)
$requestDate        = $_REQUEST["Date"]; //- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$authorization_code = $_REQUEST["AC"]; // 40 character authorization code 
$key                = $_REQUEST["Key"]; // alphanumeric 40, SHA-1 hash of the device ID + date string (MM/DD/YYYY-HH:mm) + AuthorizationCode
$language           = $_REQUEST["Language"]; // Standard Language code from mobile [e.g EN for English]
$mobile_version     = $_REQUEST["MobileVersion"]; //## ( hard coded value in software)

//-------------------------------------
// Validate required parameters
if (empty($device_ID) || empty($authorization_code) || empty($key)) {
    $output = "<ResultInfo>
                   <ErrorNumber>101</ErrorNumber>
                   <Result>Fail</Result>
                   <Message>Missing required parameters.</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

//-------------------------------------
// Compute and verify security hash
$hash = sha1($device_ID . $requestDate . $authorization_code);
if ($hash != $key) {
    debug("Hash mismatch: expected $hash but received $key");
    $output = "<ResultInfo>
                   <ErrorNumber>102</ErrorNumber>
                   <Result>Fail</Result>
                   <Message>" . get_text("rrservice", "_err102b") . "</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

//-------------------------------------
// Log request
$log_text = var_export($_REQUEST, true);
$log_text = str_replace(chr(34), "'", $log_text);
$log_sql = 'INSERT INTO web_log SET method="GetTaskList", text="' . $log_text . '", created="' . date("Y-m-d H:i:s") . '"';
debug("Web log entry: " . $log_sql);
mysqli_query($mysqli_link, $log_sql);

//-------------------------------------
// Ensure mobile version is current
$current_mobile_version = get_setting("system", "current_giftology_version");
if ($current_mobile_version > $mobile_version) {
    $output = "<ResultInfo>
                   <ErrorNumber>106</ErrorNumber>
                   <Result>Fail</Result>
                   <Message>" . get_text("rrservice", "_err106") . "</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

//-------------------------------------
// Retrieve employee info from authorization code
$auth_code_safe = mysqli_real_escape_string($mysqli_link, $authorization_code);
$sql = 'SELECT * FROM authorization_code 
        JOIN employee ON authorization_code.employee_serial = employee.employee_serial 
        WHERE employee.deleted_flag=0 
        AND authorization_code.authorization_code="' . $auth_code_safe . '" LIMIT 1';
debug("Authorization lookup SQL: " . $sql);

$result = mysqli_query($mysqli_link, $sql);
if (!$result || mysqli_error($mysqli_link)) {
    $error = mysqli_error($mysqli_link);
    $output = "<ResultInfo>
                   <ErrorNumber>103</ErrorNumber>
                   <Result>Fail</Result>
                   <Message>SQL Error: " . htmlspecialchars($error) . "</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

$authorization_row = mysqli_fetch_assoc($result);
if (!$authorization_row) {
    $output = "<ResultInfo>
                   <ErrorNumber>105</ErrorNumber>
                   <Result>Fail</Result>
                   <Message>Authorization code does not match any employee.</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

$employee_serial = $authorization_row["employee_serial"];

//-------------------------------------
// Retrieve tasks for this employee
$sql = 'SELECT 
            e.event_serial, 
            wd.workflow_detail_name, 
            w.workflow_name AS contact_name, 
            wdt.workflow_detail_type_name, 
            e.event_date, 
            e.status
        FROM event e
        JOIN workflow_detail wd ON e.workflow_detail_serial = wd.workflow_detail_serial
        JOIN workflow w ON wd.workflow_serial = w.workflow_serial
        LEFT JOIN workflow_detail_type wdt ON wd.workflow_detail_type_serial = wdt.workflow_detail_type_serial
        WHERE e.contact_serial IN (
            SELECT contact_serial FROM contact_to_user WHERE user_serial = ' . intval($employee_serial) . '
        )
        AND e.deleted_flag = 0
        ORDER BY e.event_date ASC';
debug("Task list SQL: " . $sql);

$result = mysqli_query($mysqli_link, $sql);
if (!$result || mysqli_error($mysqli_link)) {
    $error = mysqli_error($mysqli_link);
    $output = "<ResultInfo>
                   <ErrorNumber>103</ErrorNumber>
                   <Result>Fail</Result>
                   <Message>SQL Error: " . htmlspecialchars($error) . "</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

//-------------------------------------
// Build output
if (mysqli_num_rows($result) == 0) {
    $output = "<ResultInfo>
                   <ErrorNumber>0</ErrorNumber>
                   <Result>Success</Result>
                   <Message>No tasks found.</Message>
                   <Selections></Selections>
               </ResultInfo>";
    send_output($output);
    exit;
}

$output = '<ResultInfo>
               <ErrorNumber>0</ErrorNumber>
               <Result>Success</Result>
               <Message>Task list found</Message>
               <Selections>';

while ($task_row = mysqli_fetch_assoc($result)) {
    $task_date = !empty($task_row["event_date"]) ? date('m/d/Y', strtotime($task_row["event_date"])) : '';
    $status = isset($task_row["status"]) ? intval($task_row["status"]) : 0;

    $output .= '
        <Task>
            <Name>' . htmlspecialchars($task_row["workflow_detail_name"]) . '</Name>
            <Serial>' . intval($task_row["event_serial"]) . '</Serial>
            <Contact>' . htmlspecialchars($task_row["contact_name"]) . '</Contact>
            <Date>' . $task_date . '</Date>
            <Status>' . $status . '</Status>
        </Task>';
}

$output .= '</Selections>
           </ResultInfo>';

//-------------------------------------
// Send final XML output
send_output($output);
exit;

//-------------------------------------
// STUB MODE FOR TESTING ONLY
//-------------------------------------
// ALC 10/29/25
// This section returns static/sample XML data for GetTaskList without querying the database.
// It is triggered only when the 'debugflag' parameter is set in the request (e.g., ?debugflag=1).
// Use this mode for testing the API response format. Do NOT use this in production.
if ($debugflag) {
    debug("Running in STUB mode returning sample XML data.");

    $output = '<ResultInfo>
                   <ErrorNumber>0</ErrorNumber>
                   <Result>Success</Result>
                   <Message>Stub Task list (sample data)</Message>
                   <Selections>
                       <Task>
                           <Name>Inventory Check</Name>
                           <Serial>1001</Serial>
                           <Contact>Warehouse A</Contact>
                           <Date>10/29/2025</Date>
                           <Status>0</Status>
                       </Task>
                       <Task>
                           <Name>Delivery Dispatch</Name>
                           <Serial>1002</Serial>
                           <Contact>Stub Employee Name</Contact>
                           <Date>10/29/2025</Date>
                           <Status>1</Status>
                       </Task>
                       <Task>
                           <Name>System Maintenance</Name>
                           <Serial>1003</Serial>
                           <Contact>IT Department</Contact>
                           <Date>10/30/2025</Date>
                           <Status>0</Status>
                       </Task>
                   </Selections>
               </ResultInfo>';
    send_output($output);
    exit;
}
?>
