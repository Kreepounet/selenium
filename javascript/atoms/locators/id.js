// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('bot.locators.id');

goog.require('bot.dom');
goog.require('goog.array');
goog.require('goog.dom');


/**
 * Tests whether the standardized W3C Selectors API are available on an
 * element and the target locator meets CSS requirements.
 * @param {!(Document|Element)} root The document or element to test for CSS
 *     selector support.
 * @return {boolean} Whether or not the root supports query selector APIs.
 * @see http://www.w3.org/TR/selectors-api/
 * @private
 */
bot.locators.id.canUseQuerySelector_ = function(root, target) {
  return !!(root.querySelectorAll && root.querySelector) && !/^\d.*/.test(target);
};


/**
 * Find an element by using the value of the ID attribute.
 * @param {string} target The id to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.id.single = function(target, root) {
  var dom = goog.dom.getDomHelper(root);

  var e = dom.getElement(target);
  if (!e) {
    return null;
  }

  // On IE getting by ID returns the first match by id _or_ name.
  if (bot.dom.getAttribute(e, 'id') == target && goog.dom.contains(root, e)) {
    return e;
  }

  var elements = dom.getElementsByTagNameAndClass('*');
  var element = goog.array.find(elements, function(element) {
    return bot.dom.getAttribute(element, 'id') == target &&
        goog.dom.contains(root, element);
  });
  return /**@type{Element}*/ (element);
};


/**
 * Find many elements by using the value of the ID attribute.
 * @param {string} target The id to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {!goog.array.ArrayLike} All matching elements, or an empty list.
 */
bot.locators.id.many = function(target, root) {
  if (!target) {
    return [];
  }
  if (bot.locators.id.canUseQuerySelector_(root, target)) {
    try {
      // ID can contain anything but spaces. Need to escape for CSS selector.
      // http://www.w3.org/TR/html5/dom.html#the-id-attribute
      return root.querySelectorAll('#' + bot.locators.id.cssEscape_(target));
    } catch (e) {
      return [];
    }
  }
  var dom = goog.dom.getDomHelper(root);
  var elements = dom.getElementsByTagNameAndClass('*', null, root);
  return goog.array.filter(elements, function(e) {
    return bot.dom.getAttribute(e, 'id') == target;
  });
};

/**
 * Given a string, escapes all the characters that have special meaning in CSS.
 * https://mathiasbynens.be/notes/css-escapes
 *
 * This could be further improved, perhaps by using
 * http://dev.w3.org/csswg/cssom/#the-css.escape()-method , where implemented,
 * or a polyfill such as https://github.com/mathiasbynens/CSS.escape.
 *
 * @param {!string} s String to escape CSS meaningful characters in.
 * @return {!string} Escaped string.
 * @private
 */
bot.locators.id.cssEscape_ = function(s) {
  // One backslash escapes things in a regex statement; we need two in a string.
  return s.replace(/(['"\\#.:;,!?+<>=~*^$|%&@`{}\-\/\[\]\(\)])/g, '\\$1');
};
