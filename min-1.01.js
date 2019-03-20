      (function() {
        var Gallery = (function() {
          var stageImageContentTemplate = '';
          var stageImageTemplate = '';
          var viewMoreTemplate = '';
          var modalTemplate = '';
          var slideTemplate = '';
          var modalSlideTemplate = '';
          var modalImageTemplate = '';

          var Gallery = function(options) {
            SELF = this;
            this.options = options;
            this.$el = options.container;
            this.title = options.title || 'Photo';
            this.images = options.images;
            this.activeImageIndex = 0;
            this.pod = this.$el.dataset.pod;
            if (this.pod !== '') this.pod += '-';
            init_style(SELF);
            init_template(SELF);
            this.$el.insertAdjacentHTML('beforeend', modalTemplate);
            this.thumbsWrapper = this.$el.querySelector(
              '.' + SELF.pod + 'gallery_modal-slides'
            );
            init();
          };

          // simple template engine
          var templateEngine = function(template, data) {
            for (var key in data) {
              template = template.replace(
                new RegExp('{' + key + '}', 'g'),
                data[key]
              );
            }
            return template;
          };

          // bind events once, catch all
          var bindEvents = function(SELF) {
            SELF.$el.addEventListener(
              'click',
              function(event) {
                // click gallery, open lightbox
                if (
                  event.target.matches('.' + SELF.pod + 'gallery_slide-img') ||
                  event.target.matches('.' + SELF.pod + 'gallery_view-btn') ||
                  event.target.matches('.' + SELF.pod + 'gallery_stage-img')
                ) {
                  var index = event.target.dataset.index;
                  showLightBox(index, SELF);
                }

                // click lightbox thumb, highlight it
                if (
                  event.target.matches('.' + SELF.pod + 'gallery_modal-slide-img')
                ) {
                  highlightThumb(event.target, SELF);
                }

                // prev thumb
                if (event.target.matches('.' + SELF.pod + 'gallery_prev-thumb')) {
                  if (SELF.activeImageIndex - 1 >= 0) {
                    var prevThumb = SELF.thumbsWrapper.querySelector(
                      `img[data-index='${SELF.activeImageIndex - 1}']`
                    );
                    highlightThumb(prevThumb, SELF);
                  }
                }

                // next thumb
                if (event.target.matches('.' + SELF.pod + 'gallery_next-thumb')) {
                  if (SELF.activeImageIndex + 1 < SELF.images.length) {
                    var nextThumb = SELF.thumbsWrapper.querySelector(
                      `img[data-index='${SELF.activeImageIndex + 1}']`
                    );
                    highlightThumb(nextThumb, SELF);
                  }
                }

                // close lightbox
                if (
                  event.target.matches('.' + SELF.pod + 'gallery_close-modal') ||
                  event.target.matches('.' + SELF.pod + 'gallery_modal-header') ||
                  event.target.matches('.' + SELF.pod + 'gallery_modal-body') ||
                  event.target.matches('.' + SELF.pod + 'gallery_modal-footer')
                ) {
                  SELF.$el
                    .querySelector('.' + SELF.pod + 'gallery_modal-wrapper')
                    .classList.add('' + SELF.pod + 'gallery_hide');
                }
              },
              false
            );

            document.addEventListener('keydown', function(event) {
              var key = event.keyCode ? event.keyCode : event.which;
              if (key == 27) {
                SELF.thumbsWrapper.style.transform = 'none';
                SELF.$el
                  .querySelector('.' + SELF.pod + 'gallery_modal-wrapper')
                  .classList.add('' + SELF.pod + 'gallery_hide');
              }
              if (key == 37) {
                if (SELF.activeImageIndex - 1 >= 0) {
                  var prevThumb = SELF.thumbsWrapper.querySelector(
                    `img[data-index='${SELF.activeImageIndex - 1}']`
                  );
                  highlightThumb(prevThumb, SELF);
                }
              }
              if (key == 39) {
                if (SELF.activeImageIndex + 1 < SELF.images.length) {
                  var nextThumb = SELF.thumbsWrapper.querySelector(
                    `img[data-index='${SELF.activeImageIndex + 1}']`
                  );
                  highlightThumb(nextThumb, SELF);
                }
              }
            });

            var swipedir,
              startX,
              distX,
              threshold = 30,
              startTime;

            SELF.$el
              .querySelector('.' + SELF.pod + 'gallery_modal-image-wrapper')
              .addEventListener(
                'touchstart',
                function(e) {
                  var touchobj = e.changedTouches[0];
                  swipedir = 'none';
                  dist = 0;
                  startX = touchobj.pageX;
                  startTime = new Date().getTime();
                  e.preventDefault();
                },
                false
              );

            SELF.$el
              .querySelector('.' + SELF.pod + 'gallery_modal-image-wrapper')
              .addEventListener(
                'touchmove',
                function(e) {
                  e.preventDefault();
                },
                false
              );

            SELF.$el
              .querySelector('.' + SELF.pod + 'gallery_modal-image-wrapper')
              .addEventListener(
                'touchend',
                function(e) {
                  var touchobj = e.changedTouches[0];
                  distX = touchobj.pageX - startX;
                  if (Math.abs(distX) >= threshold) {
                    swipedir = distX < 0 ? 'left' : 'right';
                    if (swipedir === 'left') {
                      if (SELF.activeImageIndex + 1 < SELF.images.length) {
                        var nextThumb = SELF.thumbsWrapper.querySelector(
                          `img[data-index='${SELF.activeImageIndex + 1}']`
                        );
                        highlightThumb(nextThumb, SELF);
                      }
                    } else {
                      if (SELF.activeImageIndex - 1 >= 0) {
                        var prevThumb = SELF.thumbsWrapper.querySelector(
                          `img[data-index='${SELF.activeImageIndex - 1}']`
                        );
                        highlightThumb(prevThumb, SELF);
                      }
                    }
                  }
                  e.preventDefault();
                },
                false
              );
          };

          // hightlight specified thumb
          var highlightThumb = function(thumb, SELF) {
            if (thumb === null) return;

            if (SELF.activeImageIndex !== parseInt(thumb.dataset.index)) {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_modal-image-wrapper'
              ).children[0].style.opacity = 0.01;
            }
            SELF.activeImageIndex = parseInt(thumb.dataset.index);
            setTimeout(function() {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_modal-image-wrapper'
              ).innerHTML = templateEngine(modalImageTemplate, {
                src: SELF.images[SELF.activeImageIndex],
              });
            }, 180);
            setTimeout(function() {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_modal-image-wrapper'
              ).children[0].style.opacity = 1;
            }, 200);
            SELF.thumbsWrapper
              .querySelector('.' + SELF.pod + 'gallery_active')
              .classList.remove('' + SELF.pod + 'gallery_active');
            thumb.parentNode.classList.add('' + SELF.pod + 'gallery_active');

            var left = thumb.parentNode.offsetLeft;
            var right = 0;
            if (window.innerWidth > window.innerHeight * 1.05) {
              left -= SELF.thumbsWrapper.offsetWidth / 2 - thumb.offsetWidth / 2;
              right = 112 * SELF.images.length - 12 - window.innerHeight * 1.05;
            } else {
              left -= window.innerWidth / 2 - thumb.offsetWidth / 2;
              right = 112 * SELF.images.length + 28 - window.innerWidth;
            }
            if (left < 0) left = 0;
            if (left > right) left = right;

            SELF.thumbsWrapper.scrollTo({ top: 0, left: left, behavior: 'smooth' });

            SELF.$el.querySelector(
              '.' + SELF.pod + 'gallery_modal-slide-info'
            ).innerHTML = `${SELF.activeImageIndex + 1} / ${SELF.images.length}`;

            if (SELF.activeImageIndex === 0) {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_prev'
              ).style.opacity = 0.3;
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_next'
              ).style.opacity = 1;
            } else if (SELF.activeImageIndex === SELF.images.length - 1) {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_prev'
              ).style.opacity = 1;
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_next'
              ).style.opacity = 0.3;
            } else {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_prev'
              ).style.opacity = 1;
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_next'
              ).style.opacity = 1;
            }

            if (SELF.images.length === 1) {
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_prev'
              ).style.opacity = 0.3;
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_next'
              ).style.opacity = 0.3;
            }
          };

          // open lightbox
          var showLightBox = function(index, SELF) {
            SELF.activeImageIndex = index;
            var classList = SELF.$el.querySelector(
              '.' + SELF.pod + 'gallery_modal-wrapper'
            ).classList;
            if (classList.contains('' + SELF.pod + 'gallery_hide')) {
              classList.remove('' + SELF.pod + 'gallery_hide');
            }
            init_template(SELF);
            SELF.$el.querySelector(
              '.' + SELF.pod + 'gallery_modal-image-wrapper'
            ).innerHTML = templateEngine(modalImageTemplate, {
              src: SELF.images[SELF.activeImageIndex],
            });

            // render modal slides
            var slidesHtml = SELF.images
              .map(function(image, index) {
                var className =
                  parseInt(SELF.activeImageIndex) === index
                    ? '' + SELF.pod + 'gallery_active'
                    : '';

                return templateEngine(modalSlideTemplate, {
                  className,
                  src: image,
                  index,
                });
              })
              .join('');
            SELF.$el.querySelector(
              '.' + SELF.pod + 'gallery_modal-slides'
            ).innerHTML = slidesHtml;
            var activeThumb = SELF.thumbsWrapper.querySelector(
              '.' + SELF.pod + 'gallery_active>img'
            );

            highlightThumb(activeThumb, SELF);
          };

          var imageLoad = function(URL, selector, SELF) {
            selector.classList.add(SELF.pod + 'gallery_loader');
            var imageLoder = new Image();
            imageLoder.src = URL;
            imageLoder.onload = function() {
              setTimeout(function() {
                selector.classList.remove(SELF.pod + 'gallery_loader');
              }, 3000);
            };
            imageLoder.onerror = function() {
              setTimeout(function() {
                selector.classList.add(SELF.pod + 'gallery_loader');
              }, 3000);
            };
          };

          // bootstrap the gallery
          var init = function() {
            // render active image
            SELF.$el.classList.add('' + SELF.pod + 'gallery_wrapper');
            SELF.$el.insertAdjacentHTML('beforeend', stageImageContentTemplate);
            SELF.$el.querySelector(
              '.' + SELF.pod + 'gallery_stage'
            ).innerHTML = templateEngine(stageImageTemplate, {
              src: SELF.images[SELF.activeImageIndex],
              index: SELF.activeImageIndex,
            });

            imageLoad(
              SELF.images[SELF.activeImageIndex],
              SELF.$el.querySelector('.' + SELF.pod + 'gallery_stage'),
              SELF
            );

            var slidesHtml = '';
            if (SELF.images.length >= 6) {
              SELF.$el
                .querySelector('.' + SELF.pod + 'gallery_stage')
                .insertAdjacentHTML(
                  'afterend',
                  '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides1"></article>' +
                    '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides2"></article>'
                );

              slidesHtml = SELF.images
                .slice(1, 4)
                .map(function(image, index) {
                  index++;
                  if (index === 3 && SELF.images.length > 4) {
                    index--;
                    return templateEngine(viewMoreTemplate, {
                      index,
                      count: SELF.images.length - 2,
                    });
                  }
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join(' ');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides1'
              ).innerHTML = slidesHtml;
              SELF.images.slice(1, 4).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides1 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });

              slidesHtml = SELF.images
                .slice(3, 5)
                .map(function(image, index) {
                  index = index + 3;
                  if (index === 4 && SELF.images.length > 5) {
                    return templateEngine(viewMoreTemplate, {
                      index,
                      count: SELF.images.length - 4,
                    });
                  }
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join('');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides2'
              ).innerHTML = slidesHtml;
              SELF.images.slice(3, 5).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides2 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });
            }
            if (SELF.images.length === 5) {
              SELF.$el
                .querySelector('.' + SELF.pod + 'gallery_stage')
                .insertAdjacentHTML(
                  'afterend',
                  '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides1"></article>' +
                    '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides2"></article>'
                );

              slidesHtml = SELF.images
                .slice(1, 4)
                .map(function(image, index) {
                  index++;
                  if (index === 3 && SELF.images.length > 4) {
                    index--;
                    return templateEngine(viewMoreTemplate, {
                      index,
                      count: SELF.images.length - 2,
                    });
                  }
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join(' ');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides1'
              ).innerHTML = slidesHtml;
              SELF.images.slice(1, 4).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides1 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });

              slidesHtml = SELF.images
                .slice(3, 5)
                .map(function(image, index) {
                  index = index + 2;
                  index++;
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join('');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides2'
              ).innerHTML = slidesHtml;
              SELF.images.slice(3, 5).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides2 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });
            }
            if (SELF.images.length === 4) {
              SELF.$el
                .querySelector('.' + SELF.pod + 'gallery_stage')
                .insertAdjacentHTML(
                  'afterend',
                  '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides1"></article>' +
                    '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides2"></article>'
                );

              slidesHtml = SELF.images
                .slice(1, 3)
                .map(function(image, index) {
                  index++;
                  if (index === 2 && SELF.images.length > 3) {
                    return templateEngine(viewMoreTemplate, {
                      index,
                      count: SELF.images.length - 2,
                    });
                  }
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join(' ');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides1'
              ).innerHTML = slidesHtml;
              SELF.images.slice(1, 3).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides1 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });

              slidesHtml = SELF.images
                .slice(2, 4)
                .map(function(image, index) {
                  index = index + 2;
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join('');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides2'
              ).innerHTML = slidesHtml;
              SELF.images.slice(2, 4).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides2 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });
            }
            if (SELF.images.length === 3) {
              SELF.$el
                .querySelector('.' + SELF.pod + 'gallery_stage')
                .insertAdjacentHTML(
                  'afterend',
                  '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides1"></article>'
                );

              slidesHtml = SELF.images
                .slice(1, 3)
                .map(function(image, index) {
                  index++;
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join(' ');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides1'
              ).innerHTML = slidesHtml;
              SELF.images.slice(1, 3).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides1 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });
            }
            if (SELF.images.length === 2) {
              SELF.$el
                .querySelector('.' + SELF.pod + 'gallery_stage')
                .insertAdjacentHTML(
                  'afterend',
                  '<article class="' +
                    SELF.pod +
                    'gallery_slides ' +
                    SELF.pod +
                    'gallery_slides1"></article>'
                );
              slidesHtml = SELF.images
                .slice(1, 2)
                .map(function(image, index) {
                  index++;
                  return templateEngine(slideTemplate, { src: image, index });
                })
                .join(' ');
              SELF.$el.querySelector(
                '.' + SELF.pod + 'gallery_slides1'
              ).innerHTML = slidesHtml;
              SELF.images.slice(1, 2).forEach(function(image, index) {
                index++;
                imageLoad(
                  image,
                  SELF.$el.querySelector(
                    '.' +
                      SELF.pod +
                      'gallery_slides1 .' +
                      SELF.pod +
                      'gallery_slide-content:nth-child(' +
                      index +
                      ')'
                  ),
                  SELF
                );
              });
            }

            bindEvents(SELF);
          };

          var init_style = function(SELF) {
            var style = document.createElement('style');
            style.type = 'text/css';

            style.innerHTML =
              `
                      .` +
              SELF.pod +
              `gallery_wrapper {
                          display: flex;
                          overflow: hidden;
                          border: 1px solid #ffffff !important;
                          background-color: #E8EEEE;
                      }

                      .` +
              SELF.pod +
              `gallery_wrapper > * {
                          font-size: 16px;
                      }

                      .` +
              SELF.pod +
              `gallery_stage {
                          width: 100%;
                          height: 100%;
                          overflow: hidden;
                      }

                      .` +
              SELF.pod +
              `gallery_stage {
                          display: flex !important;
                          overflow: hidden !important;
                          align-items: center !important;
                          justify-content: center !important;
                          vertical-align: middle !important;
                          position: relative !important;
                          width: 67%;
                          height: 294.6666666666667px !important;
                      }

                      .` +
              SELF.pod +
              `gallery_stage-img {
                          position: absolute !important;
                          background-size: cover !important;
                          width: 100% !important;
                          height: 100% !important;
                          transform: scale(1) !important;
                          background-repeat: no-repeat !important;
                          background-position: center center !important;
                          transition: all 450ms cubic-bezier(0.645, 0.045, 0.355, 1) 0s !important;
                          cursor: pointer;
                          border: 1px solid #ffffff !important;
                      }

                      .` +
              SELF.pod +
              `gallery_stage-img:hover {
                          transform: scale(1.05) !important;
                      }

                      #gallery-1 .` +
              SELF.pod +
              `gallery_stage {
                          width: 100% !important;
                      }

                      .` +
              SELF.pod +
              `gallery_slides {
                          flex_direction: column !important;
                          position: relative !important;
                          width: 33% !important;
                          overflow: hidden !important;
                          height: 294.6666666666667px !important;
                      }

                      .` +
              SELF.pod +
              `gallery_lides1 {
                          display: block;
                      }

                      .` +
              SELF.pod +
              `gallery_slides2 {
                          display: none;
                      }

                      .` +
              SELF.pod +
              `gallery_slide-content {
                          display: flex !important;
                          overflow: hidden !important;
                          align-items: center !important;
                          justify-content: center !important;
                          vertical-align: middle !important;
                          position: relative !important;
                          height: 50% !important;
                          border: 1px solid #ffffff !important;
                      }

                      #gallery-4 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content {
                          height: 50% !important;
                      }

                      #gallery-2 .` +
              SELF.pod +
              `gallery_slides .` +
              SELF.pod +
              `gallery_slide-content {
                          height: 100% !important;
                      }

                      #gallery-more .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(2),
                      #gallery-5 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(2) {
                          display: none !important;
                      }

                      #gallery-more .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(3),
                      #gallery-5 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(3),
                      #gallery-4 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(2) {
                          display: block !important;
                      }

                      .` +
              SELF.pod +
              `gallery_slide-img {
                          position: absolute !important;
                          background-size: cover !important;
                          width: 100% !important;
                          height: 100% !important;
                          transform: scale(1) !important;
                          background-repeat: no-repeat !important;
                          background-position: center center !important;
                          transition: all 450ms cubic-bezier(0.645, 0.045, 0.355, 1) 0s !important;
                          cursor: pointer;
                      }

                      .` +
              SELF.pod +
              `gallery_slide-img:hover {
                          transform: scale(1.05) !important;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-content {
                          background: rgb(255, 255, 255) !important;
                          position: fixed !important;
                          top: 100vh !important;
                          right: 0px !important;
                          bottom: 0px !important;
                          left: 0px !important;
                          z-index: 2;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-wrapper {
                          position: fixed;
                          z-index: 2000;
                          top: 0;
                          right: 0;
                          bottom: 0;
                          left: 0;
                          background-color: rgba(0, 0, 0, 0.85);
                          display: flex;
                          flex-direction: column;
                          user-select: none;
                          -webkit-user-select: none;
                      }

                      .` +
              SELF.pod +
              `gallery_hide {
                          display: none;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-header {
                          position: relative;
                          background-color: #000000;
                          padding: 0;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-header h4 {
                          display: block;
                      }

                      .` +
              SELF.pod +
              `gallery_close-btn {
                          position: absolute;
                          padding: 0;
                          right: 16px;
                          top: 16px;
                          z-index: 1;
                      }

                      .` +
              SELF.pod +
              `gallery_close-btn button {
                          background-color: transparent;
                          border: none;
                          padding: 0;
                          cursor: pointer;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-body {
                          width: 100% !important;
                          margin: 0px auto !important;
                          position: relative;
                          overflow: hidden;
                          height: 80vh;
                          display: flex;
                          align-items: center;
                          padding: 0 20px;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-image-wrapper {
                          width: 100%;
                          max-width: 105vh;
                          margin: 0 auto;
                          display: flex;
                          overflow: hidden;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-img {
                          object-fit: fill;
                          width: 100%;
                          max-width: 105vh;
                          height: 100%;
                          background-size: cover !important;
                          z-index: 1 !important;
                          transform: translateX(0px) scale(1);
                          opacity: 0.01;
                          background-repeat: no-repeat !important;
                          background-position: center center !important;
                          transition: opacity 180ms ease-out 0s, transform 150ms ease-out 0s;
                          border-radius: 3px;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-slide-img {
                          object-fit: fill;
                          width: 100%;
                          height: 100%;
                          border-radius: 5px;
                      }

                      .` +
              SELF.pod +
              `gallery_prev {
                          display: flex;
                          cursor: pointer !important;
                          position: absolute !important;
                          top: 50% !important;
                          transform: translateY(-50%);
                          z-index: 100 !important;
                          font-size: 0.5em !important;
                          left: 25px !important;
                          background: none !important;
                          border-width: 0px !important;
                          border-style: initial !important;
                          border-color: initial !important;
                          border-image: initial !important;
                          align-items: center;
                      }

                      .` +
              SELF.pod +
              `gallery_next {
                          display: flex;
                          cursor: pointer !important;
                          position: absolute !important;
                          top: 50% !important;
                          transform: translateY(-50%);
                          z-index: 100 !important;
                          font-size: 0.5em !important;
                          right: 25px !important;
                          background: none !important;
                          border-width: 0px !important;
                          border-style: initial !important;
                          border-color: initial !important;
                          border-image: initial !important;
                          align-items: center;
                      }

                      .` +
              SELF.pod +
              `gallery_slide-img:hover {
                          transform: scale(1.1);
                          transition: -ms-transform 450ms cubic-bezier(0.645, 0.045, 0.355, 1) 0s,
                          -webkit-transform 450ms cubic-bezier(0.645, 0.045, 0.355, 1) 0s,
                          transform 450ms cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-footer {
                          position: relative;
                          overflow: hidden;
                          width: 100% !important;
                          padding: 0 20px;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-slide-info {
                          color: white;
                          display: none;
                          max-width: 105vh;
                          margin: 0 auto;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-slides {
                          -webkit-overflow-scrolling: touch;
                          position: relative;
                          display: block;
                          white-space: nowrap;
                          padding: 0;
                          transition: -ms-transform 0.3s ease-out 0s, -webkit-transform 0.3s ease-out 0s,
                          transform 0.3s ease-out 0s !important;
                          max-width: 105vh;
                          overflow-x: auto;
                          margin: 15px auto;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-slides::-webkit-scrollbar {
                          width: 0;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-slide {
                          width: 100px;
                          overflow: hidden;
                          display: inline-flex;
                      }

                      .` +
              SELF.pod +
              `gallery_modal-slide:hover {
                          cursor: pointer;
                          opacity: 1;
                      }

                      .` +
              SELF.pod +
              `gallery_active {
                          opacity: 1 !important;
                          position: relative;
                      }

                      .` +
              SELF.pod +
              `gallery_active img {
                          border: 1px solid white;
                      }

                      .` +
              SELF.pod +
              `gallery_view-more {
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          text-align: center;
                          height: 100%;
                          cursor: pointer;
                          background-color: #EBF0F0;
                      }

                      .` +
              SELF.pod +
              `gallery_view-more:hover {
                          transform: none;
                      }

                      @media (min-width: 1200px) {
                          .` +
              SELF.pod +
              `gallery_slides {
                              width: 25% !important;
                          }
                      }

                      @media (min-width: 1128px) {
                          .` +
              SELF.pod +
              `gallery_prev, .` +
              SELF.pod +
              `gallery_next {
                              font-size: medium !important;
                          }
                      }

                      @media (min-height: 700px) {
                          .` +
              SELF.pod +
              `gallery_stage {
                              height:294.6666666666667px !important;
                          }
                      }

                      @media (min-height: 850px) {
                          .` +
              SELF.pod +
              `gallery_stage {
                              height:394.6666666666667px !important;
                          }
                      }

                      @media (min-height: 1000px) {
                          .` +
              SELF.pod +
              `gallery_stage {
                              height:494.6666666666667px !important;
                          }
                      }

                      @media (min-width: 744px) {
                          @media (min-height: 700px) {
                              .` +
              SELF.pod +
              `gallery_stage {
                                  height:353.6px !important;
                              }
                          }

                          @media (min-height: 850px) {
                              .` +
              SELF.pod +
              `gallery_stage {
                                  height:473.6px !important;
                              }
                          }

                          @media (min-height: 1000px) {
                              .` +
              SELF.pod +
              `gallery_stage {
                                  height:593.6px !important;
                              }
                          }
                      }

                      @media (min-width: 800px) {
                          .` +
              SELF.pod +
              `gallery_stage {
                              width:50% !important;
                          }

                          @media (min-height: 700px) {
                              .` +
              SELF.pod +
              `gallery_stage {
                                  height:442px !important;
                              }
                          }

                          @media (min-height: 850px) {
                              .` +
              SELF.pod +
              `gallery_stage {
                              }
                          }
                      }

                      @media (min-height: 700px) {
                          .` +
              SELF.pod +
              `gallery_slides {
                              height:294.6666666666667px !important;
                          }
                      }

                      @media (min-height: 850px) {
                          .` +
              SELF.pod +
              `gallery_slides {
                              height:394.6666666666667px !important;
                          }
                      }

                      @media (min-height: 1000px) {
                          .` +
              SELF.pod +
              `gallery_slides {
                              height:494.6666666666667px !important;
                          }
                      }

                      @media (min-width: 744px) {
                          @media (min-height: 700px) {
                              .` +
              SELF.pod +
              `gallery_slides {
                                  height:353.6px !important;
                              }
                          }

                          @media (min-height: 850px) {
                              .` +
              SELF.pod +
              `gallery_slides {
                                  height:473.6px !important;
                              }
                          }

                          @media (min-height: 1000px) {
                              .` +
              SELF.pod +
              `gallery_slides {
                                  height:593.6px !important;
                              }
                          }
                      }

                      @media (min-width: 800px) {
                          .` +
              SELF.pod +
              `gallery_slides {
                              width: 25% !important;
                          }

                          @media (min-height: 700px) {
                              .` +
              SELF.pod +
              `gallery_slides {
                                  height:442px !important;
                              }
                          }

                          @media (min-height: 850px) {
                              .` +
              SELF.pod +
              `gallery_slides {
                              }
                          }

                          @media (min-height: 1000px) {
                              .` +
              SELF.pod +
              `gallery_slides {}
                          }
                      }

                      @media (min-width: 800px) {
                          #gallery-more .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(2),
                          #gallery-5 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(2){
                              display: block !important;
                          }

                          #gallery-more .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(3),
                          #gallery-5 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(3),
                          #gallery-4 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content:nth-child(2) {
                              display: none !important;
                          }

                          #gallery-4 .` +
              SELF.pod +
              `gallery_slides1 .` +
              SELF.pod +
              `gallery_slide-content {
                              height: 100% !important;
                          }

                          #gallery-3 .` +
              SELF.pod +
              `gallery_stage {
                              width: 60% !important;
                          }

                          #gallery-3 .` +
              SELF.pod +
              `gallery_slides1 {
                              width: 40% !important;
                          }

                          #gallery-2 .` +
              SELF.pod +
              `gallery_stage {
                              width: 70% !important;
                          }

                          #gallery-2 .` +
              SELF.pod +
              `gallery_slides {
                              width: 30% !important;
                          }
                          .` +
              SELF.pod +
              `gallery_modal-header {
                              background-color: transparent !important;
                              padding: 32px;
                          }
                          .` +
              SELF.pod +
              `gallery_modal-header h4 {
                              display: none !important;
                          }
                          .` +
              SELF.pod +
              `gallery_slides2 {
                              display: block !important;
                          }
                          .` +
              SELF.pod +
              `gallery_modal-slide {
                              opacity: 0.5;
                          }
                          .` +
              SELF.pod +
              `gallery_modal-slide-info {
                              display: block !important;
                          }
                      }`;
            document.getElementsByTagName('head')[0].appendChild(style);
          };

          var init_template = function(SELF) {
            stageImageContentTemplate =
              `<aside class="` +
              SELF.pod +
              `gallery_stage">
                          <div class="` +
              SELF.pod +
              `gallery_stage-img"></div>
                      </aside>`;

            stageImageTemplate =
              `<div class="` +
              SELF.pod +
              `gallery_stage-img" style="background-image: url({src})" data-index="0"></div>`;

            viewMoreTemplate =
              `
                          <div class="` +
              SELF.pod +
              `gallery_slide-content">
                             <div class="` +
              SELF.pod +
              `gallery_slide-img ` +
              SELF.pod +
              `gallery_view-more" data-index="{index}">View {count} More</div>
                          </div>`;

            modalTemplate =
              `<div class="` +
              SELF.pod +
              `gallery_modal-content">
                              <div class="` +
              SELF.pod +
              `gallery_modal-wrapper ` +
              SELF.pod +
              `gallery_hide">
                                  <div class="` +
              SELF.pod +
              `gallery_modal-header">
                                      <h4 style="color: #ffffff;margin: 14px;">` + SELF.title + `</h4>
                                      <div class="` +
              SELF.pod +
              `gallery_close-btn">
                                          <button type="button">
                                              <svg class="` +
              SELF.pod +
              `gallery_close-modal" viewBox="0 0 24 24" role="img" aria-label="Close" focusable="false" style="height: 12px; width: 12px; display: block; fill: rgb(255, 255, 255);">
                                                  <path class="` +
              SELF.pod +
              `gallery_close-modal" d="m23.25 24c-.19 0-.38-.07-.53-.22l-10.72-10.72-10.72 10.72c-.29.29-.77.29-1.06 0s-.29-.77 0-1.06l10.72-10.72-10.72-10.72c-.29-.29-.29-.77 0-1.06s.77-.29 1.06 0l10.72 10.72 10.72-10.72c.29-.29.77-.29 1.06 0s .29.77 0 1.06l-10.72 10.72 10.72 10.72c.29.29.29.77 0 1.06-.15.15-.34.22-.53.22" fill-rule="evenodd"></path>
                                              </svg>
                                          </button>
                                      </div>
                                  </div>
                                  <div class="` +
              SELF.pod +
              `gallery_modal-body">
                                      <div class="` +
              SELF.pod +
              `gallery_modal-image-wrapper">
                                          <img class="` +
              SELF.pod +
              `gallery_modal-img" src="https://picsum.photos/600/400?image=0"/>
                                      </div>
                                      <div class="` +
              SELF.pod +
              `gallery_prev">
                                          <svg class="` +
              SELF.pod +
              `gallery_prev-thumb" viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style="height: 20px; width: 20px; fill: rgb(255, 255, 255);">
                                              <path class="` +
              SELF.pod +
              `gallery_prev-thumb" d="m13.7 16.29a1 1 0 1 1 -1.42 1.41l-8-8a1 1 0 0 1 0-1.41l8-8a1 1 0 1 1 1.42 1.41l-7.29 7.29z"fill-rule="evenodd"></path>
                                          </svg>
                                      </div>
                                      <div class="` +
              SELF.pod +
              `gallery_next">
                                          <svg class="` +
              SELF.pod +
              `gallery_next-thumb" viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style="height: 20px; width: 20px; fill: rgb(255, 255, 255);">
                                              <path class="` +
              SELF.pod +
              `gallery_next-thumb" d="m4.29 1.71a1 1 0 1 1 1.42-1.41l8 8a1 1 0 0 1 0 1.41l-8 8a1 1 0 1 1 -1.42-1.41l7.29-7.29z" fill-rule="evenodd"></path>
                                          </svg>
                                      </div>
                                  </div>
                                  <div class="` +
              SELF.pod +
              `gallery_modal-footer">
                                      <div class="` +
              SELF.pod +
              `gallery_modal-slide-info"></div>
                                      <ul class="` +
              SELF.pod +
              `gallery_modal-slides"></ul>
                                  </div>
                              </div>
                          </div>`;

            slideTemplate =
              `<div class="` +
              SELF.pod +
              `gallery_slide-content"><div class="` +
              SELF.pod +
              `gallery_slide-img" style="background-image: url({src})" data-index="{index}"/></div></div>`;

            modalSlideTemplate =
              `
                          <li class="` +
              SELF.pod +
              `gallery_modal-slide {className}">
                              <img class="` +
              SELF.pod +
              `gallery_modal-slide-img" src="{src}" data-index={index} />
                          </li>`;

            modalImageTemplate =
              `<img class="` +
              SELF.pod +
              `gallery_modal-img" src="{src}" style="opacity: 0.01"/>`;
          };

          return Gallery;
        })();

        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
          module.exports = Gallery;
        else window.Gallery = Gallery;
      })();
