        function onReady(callback) {
            console.log('t');
            var intervalID = window.setInterval(checkReady, 1000);

            function checkReady() {
                if (document.getElementsByTagName('body')[0] !== undefined) {
                    window.clearInterval(intervalID);
                    callback.call(this);
                }
            }
        }

        function show(id, value) {
            document.getElementById(id).style.display = value ? 'block' : 'none';
        }

        function hideLoad(id) {
            document.getElementById(id).className = "inLoad";
            setTimeout(function() {
                document.getElementById(id).style.display = "none";
            }, 500);


        }

        onReady(function() {
            console.log('re');
            show('page', true);
            hideLoad('loading');
        });