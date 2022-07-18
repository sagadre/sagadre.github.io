function load_img_input(selected_object) {
    var rgb_mean = []
    var rgb_std = []

    for (var i = 0; i < 128; i++)
    {
        rgb_mean.push([])
        rgb_std.push([])
        for (var j = 0; j < 128; j++)
        {
            rgb_mean[i].push([])
            rgb_mean[i][j] = [0.485, 0.456, 0.406]

            rgb_std[i].push([])
            rgb_std[i][j] = [0.229, 0.224, 0.225]
        }
    }

    rgb_mean = tf.tensor(rgb_mean).expandDims(0)
    rgb_std = tf.tensor(rgb_std).expandDims(0)

    function imgLoad(url) {
        // from: https://gist.github.com/santisbon/a7c221780b528bd3ebb8
        'use strict';
        // Create new promise with the Promise() constructor;
        // This has as its argument a function with two parameters, resolve and reject
        return new Promise(function (resolve, reject) {
            // Standard XHR to load an image
            var request = new XMLHttpRequest();
            request.open('GET', url);
            request.responseType = 'blob';

            // When the request loads, check whether it was successful
            request.onload = function () {
                if (request.status === 200) {
                    // If successful, resolve the promise by passing back the request response
                    resolve(request.response);
                } else {
                    // If it fails, reject the promise with a error message
                    reject(new Error('Image didn\'t load successfully; error code:' + request.statusText));
                }
            };

            request.onerror = function () {
                // Also deal with the case when the entire request fails to begin with
                // This is probably a network error, so reject the promise with an appropriate message
                reject(new Error('There was a network error.'));
            };

            // Send the request
            request.send();
        });
    }


    var image_promises = []
    for (var i = 0; i < 8; i++)
    {
        image_promises.push(imgLoad('images/input/'+ selected_object + '_' + i+'.png'))
    }

    return image_promises
}


function load_img_tensors(selected_object)
{
    let image_promises = load_img_input(selected_object)

    let rgb_mean = []
    let rgb_std = []

    for (let i = 0; i < 128; i++)
    {
        rgb_mean.push([])
        rgb_std.push([])
        for (let j = 0; j < 128; j++)
        {
            rgb_mean[i].push([])
            rgb_mean[i][j] = [0.485, 0.456, 0.406]

            rgb_std[i].push([])
            rgb_std[i][j] = [0.229, 0.224, 0.225]
        }
    }

    rgb_mean = tf.tensor(rgb_mean).expandDims(0)
    rgb_std = tf.tensor(rgb_std).expandDims(0)

    images = [tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3]),
              tf.zeros([1, 128, 128, 3])]

    Promise.all(image_promises).then(function (response) {
        // The first runs when the promise resolves, with the request.reponse specified within the resolve() method.

        for(let i = 0; i < 8; i++)
        {
            let img = new Image();
            img.crossOrigin = "anonymous"

            let imageURL = window.URL.createObjectURL(response[i]);
            img.src = imageURL;
            img.width = 128
            img.height = 128

            img.onload = fill_image.bind(this, i, img, images)

            function fill_image(i, img, images) {
                images[i] = tf.browser.fromPixels(img).expandDims(0).toFloat().div(tf.scalar(255)).sub(rgb_mean).div(rgb_std)
            };
        }

        return images;
        // let tensorImg = tf.browser.fromPixels(img0)//.toFloat().expandDims();
        // The second runs when the promise is rejected, and logs the Error specified with the reject() method.
        }, function (Error) {
            console.log(Error);
        });
}
