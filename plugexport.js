    /**
     * @author thedark1337
     * @author TAT
     * @author ReAnna
     * @author Uri 
     * @description Gets active playlist from plug.dj and returns a download link for all media in a text file.
     * @license Copyright Â© 2012-2015 Thedark1337 and other contributors
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with this program. If not, see http://www.gnu.org/licenses/.
     */

    (function() {
        var modules = require.s.contexts._.defined;
        var Dialog = (function() {
            for (var i in modules)
                if (modules.hasOwnProperty(i) && modules[i] && modules[i].prototype && _.isFunction(modules[i].prototype.onContainerClick)) return modules[i];
        })();
        var Events = (function() {
            for (var i in modules)
                if (modules.hasOwnProperty(i) && modules[i] && _.isFunction(modules[i].dispatch) && modules[i].dispatch.length === 1) return modules[i];
        })();
        var ShowDialogEvent = (function() {
            for (var i in modules)
                if (modules.hasOwnProperty(i) && modules[i] && modules[i]._name === 'ShowDialogEvent') return modules[i];
        })();
        var dialog = Dialog.extend({
            id: 'dialog-plug2youtube',
            className: 'dialog',
            initialize: function() {
                this._super();
            },
            render: function() {
                var mediaData = [];
                var mediaLinks = [];
                var that = this;
                $.getJSON('https://plug.dj/_/playlists', function(playlistResponse) {
                    if (playlistResponse.status !== 'ok') return API.chatLog('Error, playlists not obtainable due to server error.');
                    if (!(playlistResponse.data && playlistResponse.data.length > 0)) return API.chatLog('Error, it seems you might not have playlists. Please try again.');
                    var playlists = playlistResponse.data;
                    var playlistLength = playlistResponse.data.length;
                    var iterator = 0;
                    for (playlistLength; playlistLength > iterator; iterator++) {
                        var playlist = playlists[iterator];
                        if (playlist.active) {
                            var name = playlist.name;
                            $.getJSON('https://plug.dj/_/playlists/' + playlist.id + '/media', function(playlistMedias) {
                                if (playlistMedias.status !== 'ok') return API.chatLog('Error getting playlist media. Please try again.');
                                var medias = playlistMedias.data;
                                var mediasLength = playlistMedias.data.length;
                                var mediaIterator = 0;
                                for (mediasLength; mediasLength > mediaIterator; mediaIterator++) {
                                    var media = medias[mediaIterator];
                                    var url;
                                    if (media.format === 1) {
                                        url = 'https://youtube.com/watch?v=' + media.cid;
                                    } else if (media.format === 2) {
                                        url = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + media.cid;
                                    }
                                    mediaData.push(' ' + media.author + ' - ' + media.title + ' ' + url);
                                    mediaLinks.push(url);
                                }
                                if (mediaData.length > 0) {
                                    mediaData = mediaData.join('\r\n').split();
                                    var fileData = new Blob([mediaData], {
                                        type: 'text/plain'
                                    });
                                    mediaLinks = mediaLinks.join('\r\n').split();
                                    var fileLinksData = new Blob([mediaLinks], {
                                        type: 'text/plain'
                                    });
                                    var link = $('<br/><br/><a/><br/>');
                                    var lineBreak = $('<br/><br/>');
                                    $(link).attr('href', URL.createObjectURL(fileData));
                                    $(link).attr('download', name + '.txt');
                                    $(link).text('Download song list with song names');
                                    var links = $('<br/><a/><br/>');
                                    $(links).attr('href', URL.createObjectURL(fileLinksData));
                                    $(links).attr('download', name + '.txt');
                                    $(links).text('Download song list with only links');
                                    that.$el.append(that.getHeader('Plug Song Export')).append(that.getBody().append(link, links, lineBreak));    
                                }
                            });
                        }
                    }
                });
            },
            close: function() {
                this._super();
            }
        });
        Events.dispatch(new ShowDialogEvent(ShowDialogEvent.SHOW, new dialog()));
    })();
