@extends('flarum.forum::email.plain.notification.base')

@section('notificationContent')
<% if (!content) { %><!-- Required content -->
<% } else { %><%- content %><% } %>
@endsection
